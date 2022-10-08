import { TRPCError } from "@trpc/server";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import type EmailService from "../email/email.service";
import type UsersService from "./users.service";
import type ModelsService from "../models/models.service";

import {
  ConfirmVerificationCodeSchema,
  GetVerificationDetailsSchema,
  SignInSchema,
  RegisterSchema,
  ResendVerificationCodeSchema,
} from "./users.dto";
import type { createAuthProviderJwt } from "@RoomParty/auth-providers";

const RESEND_VERIFICATION_DATE_DURATION_IN_MS = 1_000 * 60 * 2;

@injectable()
class UsersController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Email) private emailService: EmailService,
    @inject(SERVICES_TYPES.Users) private usersService: UsersService
  ) {}

  async me(id: string) {
    return await this.modelsService.client.account.findFirst({
      where: { id },
      select: {
        id: true,
        user: true,
      },
    });
  }

  async signIn(
    data: SignInSchema,
    jwt: ReturnType<typeof createAuthProviderJwt>
  ) {
    const account = await this.modelsService.client.account.findFirst({
      where: { email: data.email },
    });
    if (!account)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User with this email does not exist.",
      });

    if (!account.password)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `This account is linked to the following provider: ${account.provider}. Kindly login using the provider mentioned.`,
      });

    if (!this.usersService.comparePasswordHash(data.password, account.password))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials.",
      });

    return jwt.signer(account);
  }

  async signUp(data: RegisterSchema) {
    const maybeAccount = await this.modelsService.client.account.findFirst({
      where: { email: data.email },
    });

    if (maybeAccount) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This user already exists",
      });
    }

    const createdAccount = await this.modelsService.client.account.create({
      data: {
        email: data.email,
        password: this.usersService.generatePasswordHash(data.password),
        provider: "Local",
        verificationCode: this.usersService.generateVerificationCode(),
        nextResendVerificationDate: new Date(
          Date.now() + RESEND_VERIFICATION_DATE_DURATION_IN_MS
        ),
        user: {
          create: {},
        },
      },
      select: {
        id: true,
        verificationCode: true,
        email: true,
      },
    });

    await this.emailService.sendEmailConfirmation({
      code: createdAccount.verificationCode!,
      email: createdAccount.email,
    });

    return createdAccount.id;
  }

  async getVerificationDetails(data: GetVerificationDetailsSchema) {
    const maybeAccount = await this.modelsService.client.account.findFirst({
      where: { id: data.accountId, isVerified: false },
      select: {
        email: true,
        nextResendVerificationDate: true,
      },
    });

    if (!maybeAccount) throw new TRPCError({ code: "NOT_FOUND" });

    return maybeAccount;
  }

  async resendVerificationCode(data: ResendVerificationCodeSchema) {
    const maybeAccount = await this.modelsService.client.account.findFirst({
      where: { email: data.email },
    });

    if (!maybeAccount) throw new TRPCError({ code: "NOT_FOUND" });

    if (maybeAccount.isVerified)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "This user is already verified his/her email. Please login to continue.",
      });

    if (
      maybeAccount.nextResendVerificationDate &&
      maybeAccount.nextResendVerificationDate.getTime() > Date.now()
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Please wait a few minutes.",
      });
    }

    const updatedAccount = await this.modelsService.client.account.update({
      where: { id: maybeAccount.id },
      data: {
        verificationCode: this.usersService.generateVerificationCode(),
        nextResendVerificationDate: new Date(
          Date.now() + RESEND_VERIFICATION_DATE_DURATION_IN_MS
        ),
      },
      select: {
        verificationCode: true,
        email: true,
      },
    });

    await this.emailService.sendEmailConfirmation({
      code: updatedAccount.verificationCode!,
      email: updatedAccount.email,
    });
  }

  async confirmVerificationCode(
    data: ConfirmVerificationCodeSchema,
    jwt: ReturnType<typeof createAuthProviderJwt>
  ) {
    const maybeAccount = await this.modelsService.client.account.findFirst({
      where: { email: data.email },
      select: { verificationCode: true, isVerified: true, id: true },
    });

    if (!maybeAccount)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid email address",
      });

    if (maybeAccount.isVerified)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "This user has already verified his/her email. Please login to continue.",
      });

    if (maybeAccount.verificationCode !== data.code)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid verification code.",
      });

    const updatedAccount = await this.modelsService.client.account.update({
      where: { id: maybeAccount.id },
      data: {
        verificationCode: null,
        isVerified: true,
        user: {
          update: {
            name: "User",
            picture: this.usersService.generateRandomUserPicture(
              maybeAccount.id
            ),
          },
        },
      },
    });

    return jwt.signer(updatedAccount);
  }
}

export default UsersController;

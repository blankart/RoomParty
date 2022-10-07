import { TRPCError } from "@trpc/server";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import EmailService from "../email/email.service";
import type ModelsService from "../models/models.service";
import { ConfirmVerificationCodeSchema, RegisterSchema } from "./users.dto";

@injectable()
class UsersController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService,
    @inject(SERVICES_TYPES.Email) private emailService: EmailService
  ) { }

  async me(id: string) {
    return await this.modelsService.client.account.findFirst({
      where: { id },
      select: {
        id: true,
        user: true,
      },
    });
  }

  async register(data: RegisterSchema) {
    const maybeAccount = await this.modelsService.client.account.findFirst({
      where: { email: data.email }
    })

    if (maybeAccount) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'This user already exists' })
    }

    const createdAccount = await this.modelsService.client.account.create({
      data: {
        email: data.email,
        provider: 'Local',
        verificationCode: Array(6).fill(null).reduce((p, c) => {
          return p + String(Math.floor(Math.random() * 10))
        }, ''),
        user: {
          create: {}
        }
      },
      select: {
        verificationCode: true,
        email: true,
      }
    })

    await this.emailService.sendEmailConfirmation({ code: createdAccount.verificationCode!, email: createdAccount.email })
  }

  async confirmVerificationCode(data: ConfirmVerificationCodeSchema) {
    const maybeExistingAccount = await this.modelsService.client.account.findFirst({
      where: { email: data.email },
      select: { verificationCode: true, isVerified: true, id: true }
    })

    if (!maybeExistingAccount) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid email address' })

    if (maybeExistingAccount.isVerified) throw new TRPCError({ code: 'BAD_REQUEST', message: 'This user is already verified his/her email. Please login to continue.' })

    if (maybeExistingAccount.verificationCode !== data.code) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid verification code.' })

    await this.modelsService.client.account.update({
      where: { id: maybeExistingAccount.id },
      data: {
        verificationCode: null,
        isVerified: true
      }
    })
  }
}

export default UsersController;

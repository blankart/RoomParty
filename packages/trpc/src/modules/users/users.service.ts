import { TRPCError } from "@trpc/server";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import ModelsService from "../models/models.service";

@injectable()
class UsersService {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
  ) {}

  generateVerificationCode() {
    return Array(6)
      .fill(null)
      .reduce((p, c) => {
        return p + String(Math.floor(Math.random() * 10));
      }, "");
  }

  async updateUserVerificationCode(email: string) {
    const maybeExistingAccount =
      await this.modelsService.client.account.findFirst({
        where: { email },
      });

    if (!maybeExistingAccount)
      throw new TRPCError({ code: "NOT_FOUND", message: "Account not found." });

    await this.modelsService.client.account.update({
      where: { id: maybeExistingAccount.id },
      data: {
        verificationCode: this.generateVerificationCode(),
        isVerified: false,
      },
    });
  }
}

export default UsersService;

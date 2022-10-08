import { TRPCError } from "@trpc/server";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import ModelsService from "../models/models.service";
import bcrypt from "bcrypt";

@injectable()
class UsersService {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
  ) {}

  static SALT_ROUNDS = 10;

  generateRandomUserPicture(str: string) {
    return `https://avatars.dicebear.com/api/jdenticon/${str}.svg`;
  }

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

  generatePasswordHash(password: string) {
    return bcrypt.hashSync(password, UsersService.SALT_ROUNDS);
  }

  comparePasswordHash(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}

export default UsersService;

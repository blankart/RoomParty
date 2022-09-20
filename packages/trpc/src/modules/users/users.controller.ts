import { inject, injectable } from "inversify";
import { SERVICES_TYPES } from "../../types/container";
import type ModelsService from "../models/models.service";

@injectable()
class UsersController {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
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
}

export default UsersController;

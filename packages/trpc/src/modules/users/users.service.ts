import { inject, injectable } from 'inversify'
import { SERVICES_TYPES } from '../../types/container';
import ModelsService from "../models/models.service";

@injectable()
class UsersService {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
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
}

export default UsersService;

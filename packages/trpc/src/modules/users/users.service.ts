import ModelsService from "../models/models.service";

class Users {
  constructor() { }
  private static instance?: Users;
  static getInstance() {
    if (!Users.instance) {
      Users.instance = new Users();
    }

    return Users.instance;
  }

  async me(id: string) {
    return await ModelsService.client.account.findFirst({
      where: { id },
      select: {
        id: true,
        user: true,
      },
    });
  }
}

const UsersService = Users.getInstance();

export default UsersService;

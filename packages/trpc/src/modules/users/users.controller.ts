import { inject, injectable } from 'inversify'
import TRPCRouter from '../../trpc/router';
import { SERVICES_TYPES, TRPC_ROUTER } from '../../types/container';
import UsersService from "./users.service";

export const USERS_ROUTER_NAME = "users";

@injectable()
class UsersController {
  constructor(
    @inject(SERVICES_TYPES.Users) private usersService: UsersService,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) {
  }

  router() {
    const self = this
    return this.trpcRouter.createRouter()
  }

  protectedRouter() {
    const self = this
    return this.trpcRouter.createProtectedRouter().query("me", {
      async resolve({ ctx }) {
        return self.usersService.me(ctx.user.id);
      },
    })
  }
}

export default UsersController
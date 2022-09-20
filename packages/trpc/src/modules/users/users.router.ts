import { inject, injectable } from 'inversify'
import type TRPCRouter from '../../trpc/router';
import { CONTROLLER_TYPES, TRPC_ROUTER } from '../../types/container';
import type UsersController from './users.controller';

export const USERS_ROUTER_NAME = "users";

@injectable()
class UsersRouter {
    constructor(
        @inject(CONTROLLER_TYPES.Users) private usersController: UsersController,
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
                return self.usersController.me(ctx.user.id);
            },
        })
    }
}

export default UsersRouter
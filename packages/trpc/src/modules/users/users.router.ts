import { inject, injectable } from "inversify";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import {
  confirmVerificationCodeSchema,
  getVerificationDetailsSchema,
  registerSchema,
  resendVerificationCodeSchema,
} from "./users.schema";

import type TRPCRouter from "../../trpc/router";
import type UsersController from "./users.controller";
export const USERS_ROUTER_NAME = "users";

@injectable()
class UsersRouter {
  constructor(
    @inject(CONTROLLER_TYPES.Users) private usersController: UsersController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) { }

  router() {
    const self = this;
    return this.trpcRouter
      .createRouter()
      .mutation("register", {
        input: registerSchema,
        async resolve({ input }) {
          return await self.usersController.register(input);
        },
      })
      .query('getVerificationDetails', {
        input: getVerificationDetailsSchema,
        async resolve({ input }) {
          return await self.usersController.getVerificationDetails(input);
        },
      })
      .mutation("resendVerificationCode", {
        input: resendVerificationCodeSchema,
        async resolve({ input }) {
          return await self.usersController.resendVerificationCode(input);
        },
      })
      .mutation("confirmVerificationCode", {
        input: confirmVerificationCodeSchema,
        async resolve({ input, ctx }) {
          return await self.usersController.confirmVerificationCode(
            input,
            ctx.jwt
          );
        },
      });
  }

  protectedRouter() {
    const self = this;
    return this.trpcRouter.createProtectedRouter().query("me", {
      async resolve({ ctx }) {
        return self.usersController.me(ctx.user.id);
      },
    });
  }
}

export default UsersRouter;

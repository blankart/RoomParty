import { createProtectedRouter, createRouter } from "../../trpc";
import UsersService from "./users.service";

export const USERS_ROUTER_NAME = "users";

export const usersRouter = createRouter()

export const usersProtectedRouter = createProtectedRouter()
  .query("me", {
    async resolve({ ctx }) {
      console.log('called')
      return UsersService.me(ctx.user.id);
    },
  });

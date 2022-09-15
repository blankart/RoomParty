import { createProtectedRouter, createRouter } from "../../trpc";
import zod from "zod";
import UsersService from "./users.service";
import { ACCESS_TOKEN_KEY } from "@rooms2watch/common-types";

export const USERS_ROUTER_NAME = "users";

export const usersRouter = createRouter()
  .mutation("googleOAuth", {
    input: zod.object({
      scope: zod.string(),
      code: zod.string(),
    }),
    async resolve({ input, ctx }) {
      const { token } = await UsersService.googleOAuth(input);

      if (token) {
        ctx.res.cookie(ACCESS_TOKEN_KEY, token);
        return true
      }

      return false
    },
  })

  .mutation('googleOAuthWithToken', {
    input: zod.object({
      access_token: zod.string(),
      scope: zod.string().optional(),
      token_type: zod.string().optional(),
      expires_in: zod.number().optional()
    }),
    async resolve({ input, ctx }) {
      const isSuccess = await UsersService.googleOAuthWithToken(input)
      if (isSuccess) {
        ctx.res.cookie(ACCESS_TOKEN_KEY, input.access_token)
        return true
      }
      return false
    }
  })

export const usersProtectedRouter = createProtectedRouter()
  .query("me", {
    async resolve({ ctx }) {
      console.log('called')
      return UsersService.me(ctx.user.id);
    },
  });

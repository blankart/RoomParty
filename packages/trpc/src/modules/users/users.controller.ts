import { createProtectedRouter, createRouter } from "../../trpc";
import zod from 'zod'
import UsersService from "./users.service";
import { ACCESS_TOKEN_KEY } from "common-types/constants";

export const USERS_ROUTER_NAME = 'users'

export const usersRouter = createRouter()
    .query('googleOAuth', {
        async resolve({ ctx }) {
            const { token, redirect } = await UsersService.googleOAuth(ctx.req.query as { state: string, code: string, scope: string })

            if (token) {
                ctx.res.cookie(ACCESS_TOKEN_KEY, token)
            }

            return redirect
        }
    })

export const usersProtectedRouter = createProtectedRouter()
    .query('me', {
        async resolve({ ctx }) {
            return UsersService.me(ctx.user.id)
        }
    })
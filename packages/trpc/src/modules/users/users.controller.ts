import { createProtectedRouter, createRouter } from "../../trpc";
import zod from 'zod'
import UsersService from "./users.service";

export const USERS_ROUTER_NAME = 'users'

export const usersRouter = createRouter()
    .query('googleOAuth', {
        async resolve({ ctx }) {
            const data = ctx.req.query as { state: string, code: string, scope: string }
            return UsersService.googleOAuth(data)
        }
    })

export const usersProtectedRouter = createProtectedRouter()
    .query('me', {
        async resolve({ ctx }) {
            console.log('test')
            return ctx.user
        }
    })
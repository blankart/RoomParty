import * as trpc from '@trpc/server'
import { inferAsyncReturnType } from '@trpc/server';

import * as trpcExpress from '@trpc/server/adapters/express';
import UsersService from './modules/users/users.service';
import getAccessToken from './utils/getAccessToken';

export const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => {
    return {
        req,
        res,
    };
};

type Context = inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>()


export const createRouterWithUser = () => trpc.router<Context>()
    .middleware(async ({ ctx, next }) => {
        const user = await UsersService.getGoogleOAuth(getAccessToken(ctx))

        return next({
            ctx: { ...ctx, user }
        })
    })

export const createProtectedRouter = () => trpc.router<Context>()
    .middleware(async ({ ctx, next }) => {
        // Google Auth
        const user = await UsersService.getGoogleOAuth(getAccessToken(ctx))
        if (!user) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' })

        return next({
            ctx: { ...ctx, user }
        })
    })
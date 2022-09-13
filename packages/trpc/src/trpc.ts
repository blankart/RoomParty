import * as trpc from '@trpc/server'
import { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import ModelsService from './modules/models/models.service';
import UsersService from './modules/users/users.service';
import { parseCookies } from 'nookies'
import { ACCESS_TOKEN_KEY } from './constants';

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

export const createProtectedRouter = () => trpc.router<Context>()
    .middleware(async ({ ctx, next }) => {
        /**
         * Google OAuth
         */
        let access_token: string | undefined =
            ctx.req.headers['authorization'] ||
            parseCookies(ctx)[ACCESS_TOKEN_KEY]

        access_token =
            access_token?.startsWith('Bearer ') ?
                access_token.substring('Bearer '.length, access_token.length) :
                access_token

        if (!access_token) {
            throw new trpc.TRPCError({ code: 'UNAUTHORIZED' })
        }

        try {
            const userInfo = await UsersService.getGoogleOAuth(access_token)
            const user = await ModelsService.client.account.findFirst({
                where: {
                    provider: 'Google',
                    providerId: userInfo.id!
                },
                include: {
                    user: true
                }
            })

            if (!user) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' })

            return next({
                ctx: {
                    ...ctx,
                    user
                }
            })
        } catch {
            throw new trpc.TRPCError({ code: 'UNAUTHORIZED' })
        }
    })
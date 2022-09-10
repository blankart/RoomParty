import * as trpc from '@trpc/server'
import { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

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

export const createProtectedRouter = () => trpc.router<Context>().middleware(({ ctx, next }) => {
    /**
     * TODO: Create protected router for authenticated users
     */
    return next({
        ctx: {
            ...ctx,
        }
    })
})
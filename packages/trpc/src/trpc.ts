import * as trpc from "@trpc/server";
import { inferAsyncReturnType } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

import ModelsService from "./modules/models/models.service";
import UsersService from "./modules/users/users.service";
import getAccessToken from "./utils/getAccessToken";

import type { JwtPayloadDecoded, JwtVerifier } from '@rooms2watch/auth-providers'
import { CurrentUser } from "./types/user";

export const createContext = (jwt: JwtVerifier) => ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  return {
    req,
    res,
    jwt
  };
};

type Context = inferAsyncReturnType<ReturnType<typeof createContext>>;

export const createRouter = () => trpc.router<Context>();

export const createRouterWithUser = () =>
  trpc.router<Context>().middleware(async ({ ctx: { jwt, ...ctx }, next }) => {
    let decoded: undefined | JwtPayloadDecoded
    let user = null
    try {
      decoded = await jwt(getAccessToken(ctx))
    } catch { }

    if (decoded) {
      user = await ModelsService.client.account.findFirst({ where: { providerId: decoded.providerId, provider: decoded.provider }, include: { user: true } })
    }

    return next({
      ctx: { ...ctx, user },
    });
  });

export const createProtectedRouter = () =>
  trpc.router<Context>().middleware(async ({ ctx: { jwt, ...ctx }, next }) => {
    let decoded: undefined | JwtPayloadDecoded
    try {
      decoded = await jwt(getAccessToken(ctx))
    } catch { }
    if (!decoded) throw new trpc.TRPCError({ code: "UNAUTHORIZED" });

    const user = await ModelsService.client.account.findFirst({ where: { providerId: decoded.providerId, provider: decoded.provider }, include: { user: true } })

    if (!user) throw new trpc.TRPCError({ code: "UNAUTHORIZED" });

    return next({
      ctx: { ...ctx, user },
    });
  });

import * as trpc from "@trpc/server";
import type { JwtPayloadDecoded, JwtVerifier } from "@RoomParty/auth-providers";
import { injectable, inject } from "inversify";
import type * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType } from "@trpc/server";
import getAccessToken from "../utils/getAccessToken";
import { SERVICES_TYPES } from "../types/container";
import ModelsService from "../modules/models/models.service";

type Context = inferAsyncReturnType<ReturnType<TRPCRouter["createContext"]>>;

@injectable()
class TRPCRouter {
  constructor(
    @inject(SERVICES_TYPES.Models) private modelsService: ModelsService
  ) { }
  createContext(jwt: JwtVerifier) {
    return ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
      return {
        req,
        res,
        jwt,
      };
    };
  }

  createRouter() {
    return trpc.router<Context>();
  }

  createRouterWithUser() {
    return this.createRouter().middleware(
      async ({ ctx: { jwt, ...ctx }, next }) => {
        let decoded: undefined | JwtPayloadDecoded;
        let user = null;
        try {
          decoded = await jwt(getAccessToken(ctx));
        } catch { }

        if (decoded) {
          user = await this.modelsService.client.account.findFirst({
            where: {
              id: decoded.id
            },
            include: { user: true },
          });
        }

        if (!user?.isVerified) {
          user = null
        }

        return next({
          ctx: { ...ctx, user },
        });
      }
    );
  }

  createProtectedRouter() {
    return this.createRouter().middleware(
      async ({ ctx: { jwt, ...ctx }, next }) => {
        let decoded: undefined | JwtPayloadDecoded;
        try {
          decoded = await jwt(getAccessToken(ctx));
        } catch { }

        if (!decoded) throw new trpc.TRPCError({ code: "UNAUTHORIZED" });

        const user = await this.modelsService.client.account.findFirst({
          where: {
            id: decoded.id
          },
          include: { user: true },
        });

        if (!user) throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
        if (!user.isVerified) throw new trpc.TRPCError({ code: 'FORBIDDEN' })

        return next({
          ctx: { ...ctx, user },
        });
      }
    );
  }
}

export default TRPCRouter;

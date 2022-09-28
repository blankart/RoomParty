import { ACCESS_TOKEN_KEY } from "@partyfy/shared-lib";
import { parseCookies } from "nookies";
import * as trpcExpress from "@trpc/server/adapters/express";

export default function getAccessToken(
  ctx: trpcExpress.CreateExpressContextOptions
) {
  let access_token: string | undefined =
    ctx.req?.headers?.["authorization"] ||
    (ctx.req?.query?.["access_token"] as string) ||
    parseCookies(ctx)?.[ACCESS_TOKEN_KEY];

  access_token = access_token?.startsWith("Bearer ")
    ? access_token.substring("Bearer ".length, access_token.length)
    : access_token;

  return access_token;
}

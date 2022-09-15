import { createReactQueryHooks } from "@trpc/react";
import { withTRPC as _withTRPC } from "@trpc/next";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { createTRPCClient as _createTRPCClient } from "@trpc/client";

import React from "react";
import { QueryClient } from "react-query";
import superjson from "superjson";
import { parseCookies } from "nookies";

import type { AppRouter } from "@rooms2watch/trpc";
import { ACCESS_TOKEN_KEY } from "@rooms2watch/common-types";

export const trpc = createReactQueryHooks<AppRouter>();
export const _TRPCProvider = trpc.Provider;

const TRPC_URL = `${
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8000"
}/trpc`;

export const createQueryClient = () => new QueryClient();
export const createTRPCClient = (ctx?: any) => {
  return trpc.createClient({
    url: TRPC_URL,
    transformer: superjson,
    ...(process.browser
      ? {
          links: [getEndingLink()],
        }
      : {}),

    headers() {
      return {
        authorization: parseCookies(ctx)?.[ACCESS_TOKEN_KEY],
      };
    },
  });
};

function getEndingLink() {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: TRPC_URL,
    });
  }
  const client = createWSClient({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "ws://localhost:80001",
  });
  return wsLink<AppRouter>({
    client,
  });
}

export function withTRPC(C: any) {
  return _withTRPC<AppRouter>({
    config() {
      return {
        url: TRPC_URL,
        transformer: superjson,
        links: [getEndingLink()],
        headers() {
          return {
            authorization: parseCookies(null)?.[ACCESS_TOKEN_KEY],
          };
        },
      };
    },
    ssr: false,
  })(C);
}

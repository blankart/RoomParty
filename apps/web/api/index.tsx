import { createReactQueryHooks } from "@trpc/react";
import { withTRPC as _withTRPC } from "@trpc/next";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { splitLink } from "@trpc/client/links/splitLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { createTRPCClient as _createTRPCClient } from "@trpc/client";

import superjson from "superjson";
import { parseCookies } from "nookies";

import type { AppRouter } from "@rooms2watch/trpc";
import { ACCESS_TOKEN_KEY } from "@rooms2watch/shared-lib";

export const trpc = createReactQueryHooks<AppRouter>();

const TRPC_URL = `${
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8000"
}/trpc`;

export let token = "";

function getEndingLink() {
  const batchLink = httpBatchLink({
    url: TRPC_URL,
    maxBatchSize: 10,
  });
  if (typeof window === "undefined") {
    return batchLink;
  }

  return splitLink({
    condition(op) {
      return op.type === "subscription";
    },

    true: wsLink({
      client: createWSClient({
        url: process.env.NEXT_PUBLIC_WEBSOCKET_URL!,
      }),
    }),

    false: batchLink,
  });
}

export const createTRPCClient = (ctx?: any) => {
  if (parseCookies(ctx ?? null)?.[ACCESS_TOKEN_KEY]) {
    token = parseCookies(ctx ?? null)?.[ACCESS_TOKEN_KEY];
  }

  const headers: Record<string, any> = { authorization: token };
  if (ctx?.req) {
    delete ctx.req.headers?.connection;
    Object.assign(headers, {
      ...ctx.req.headers,
      "x-ssr": "1",
    });
  }

  return trpc.createClient({
    transformer: superjson,
    links: [getEndingLink()],
    headers,
  });
};

export function withTRPC(C: any) {
  return _withTRPC<AppRouter>({
    config({ ctx }) {
      if (parseCookies(ctx ?? null)?.[ACCESS_TOKEN_KEY]) {
        token = parseCookies(ctx ?? null)?.[ACCESS_TOKEN_KEY];
      }

      const headers: Record<string, any> = { authorization: token };
      if (ctx?.req) {
        delete ctx.req.headers?.connection;
        Object.assign(headers, {
          ...ctx.req.headers,
          "x-ssr": "1",
        });
      }

      return {
        links: [
          loggerLink({
            enabled: (opts) =>
              (process.env.NODE_ENV === "development" &&
                typeof window !== "undefined") ||
              (opts.direction === "down" && opts.result instanceof Error),
          }),
          getEndingLink(),
        ],
        transformer: superjson,
        queryClientConfig: {
          defaultOptions: {
            queries: {
              ssr: false,
              retry: 3,
              refetchOnWindowFocus: false,
            },
          },
        },
        headers,
      };
    },
    ssr: false,
  })(C);
}

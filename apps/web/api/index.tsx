import { createReactQueryHooks } from "@trpc/react";
import { withTRPC as _withTRPC } from "@trpc/next";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { createTRPCClient as _createTRPCClient } from "@trpc/client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import superjson from "superjson";
import { parseCookies } from "nookies";

import { AppRouter } from "trpc";
import { ACCESS_TOKEN_KEY } from "common-types";

export const trpc = createReactQueryHooks<AppRouter>();
export const _TRPCProvider = trpc.Provider;

interface TRPCProviderProps {
  children?: React.ReactNode;
}

const TRPC_URL = `${
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8000"
}/trpc`;

export const createQueryClient = () => new QueryClient();
export const createTRPCClient = (ctx?: any) => {
  let wsClient: any;
  if (process.browser) {
    wsClient = createWSClient({
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "ws://localhost:8001",
    });
  }

  return trpc.createClient({
    url: TRPC_URL,
    transformer: superjson,
    ...(process.browser
      ? {
          links: [wsLink({ client: wsClient })],
        }
      : {}),

    headers() {
      return {
        authorization: parseCookies(ctx)?.[ACCESS_TOKEN_KEY],
      };
    },
  });
};

export const TRPCProvider: React.FC<TRPCProviderProps> = ({ children }) => {
  const [queryClient] = useState(createQueryClient);
  const [trpcClient] = useState(createTRPCClient);

  return (
    <_TRPCProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </_TRPCProvider>
  );
};

export function withTRPC(C: any) {
  return _withTRPC<AppRouter>({
    config() {
      return {
        url: TRPC_URL,
        transformer: superjson,
      };
    },
  })(C);
}

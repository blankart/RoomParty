import React, { createContext, useContext, useMemo } from "react";
import { useEffect, useState } from "react";
import { parseCookies, destroyCookie } from "nookies";
import { useRouter } from "next/router";

import { trpc } from "@web/trpc";
import { ACCESS_TOKEN_KEY } from "@RoomParty/shared-lib";
import type { UseQueryResult } from "react-query";
import type { InferQueryOutput } from "@web/types/trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@RoomParty/trpc";

type UseQueryUsersMeResult = UseQueryResult<
  InferQueryOutput<"users.me">,
  TRPCClientErrorLike<AppRouter>
>;

interface AuthContextState
  extends Pick<
    UseQueryUsersMeResult,
    "error" | "isLoading" | "refetch" | "isIdle"
  > {
  user: UseQueryUsersMeResult["data"];
  hasAccessToken: boolean;
  hasUserInitialized: boolean;
  handleSignout: () => void;
  setAccessToken: (token: string | null) => any;
}

export const AuthContext = createContext<AuthContextState>({
  user: undefined,
  error: null,
  isLoading: false,
  isIdle: true,
  hasAccessToken: false,
  hasUserInitialized: false,
  refetch: async () => ({} as any),
  handleSignout: () => {},
  setAccessToken: () => {},
});

export function AuthContextProvider(props: { children?: React.ReactNode }) {
  const [hasUserInitialized, setHasUserInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState<null | string>(null);
  const router = useRouter();
  const hasAccessToken = useMemo(() => !!accessToken, [accessToken]);

  useEffect(() => {
    const accessTokenFromCookie = parseCookies(null)[ACCESS_TOKEN_KEY];

    if (accessTokenFromCookie) {
      setAccessToken(accessTokenFromCookie);
    }

    setHasUserInitialized(true);
  }, []);

  function removeAuthenticationCallback() {
    destroyCookie(null, ACCESS_TOKEN_KEY, { path: "/" });
    setAccessToken(null);
    context.setQueryData(["users.me"], () => null);
    context.setQueryData(["rooms.findMyRoom"], () => []);
    context.setQueryData(["favorited-rooms.findMyFavorites"], () => []);
    context.setQueryData(["favorited-rooms.isRoomFavorited"], () => false);
  }

  const {
    data: user,
    error,
    isLoading,
    refetch,
    isIdle,
  } = trpc.useQuery(["users.me"], {
    enabled: !!accessToken,
    onError() {
      removeAuthenticationCallback();
    },
  });

  const context = trpc.useContext();
  function handleSignout() {
    removeAuthenticationCallback();
    router.reload();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        isLoading,
        refetch,
        isIdle,
        hasAccessToken,
        hasUserInitialized,
        handleSignout,
        setAccessToken,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export const useMe = () => useContext(AuthContext);

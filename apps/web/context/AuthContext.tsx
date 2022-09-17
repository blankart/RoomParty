import React, { createContext, useContext } from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";

import { trpc } from "@web/api";
import { ACCESS_TOKEN_KEY } from "@rooms2watch/common-types";

// Only used for inferring types
function useQueryUsersMe() {
  return trpc.useQuery(["users.me"]);
}

interface AuthContextState {
  user: ReturnType<typeof useQueryUsersMe>["data"];
  error: ReturnType<typeof useQueryUsersMe>["error"];
  isLoading: ReturnType<typeof useQueryUsersMe>["isLoading"];
  isIdle: ReturnType<typeof useQueryUsersMe>["isIdle"];
  refetch: ReturnType<typeof useQueryUsersMe>["refetch"];
  hasAccessToken: boolean;
  hasUserInitialized: boolean;
  handleSignout: () => void;
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
});

export function AuthContextProvider(props: { children?: React.ReactNode }) {
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [hasUserInitialized, setHasUserInitialized] = useState(false);

  useEffect(() => {
    const accessTokenFromCookie = parseCookies(null)[ACCESS_TOKEN_KEY];

    if (accessTokenFromCookie) {
      setHasAccessToken(true);
    }

    setHasUserInitialized(true);
  }, []);

  const {
    data: user,
    error,
    isLoading,
    refetch,
    isIdle,
  } = trpc.useQuery(["users.me"], {
    enabled: hasAccessToken && !!parseCookies(null)[ACCESS_TOKEN_KEY],
    onError() {
      destroyCookie(null, ACCESS_TOKEN_KEY, { path: "/" });
      setHasAccessToken(false);
    },
  });

  const context = trpc.useContext();
  function handleSignout() {
    destroyCookie(null, ACCESS_TOKEN_KEY, { path: "/" });
    context.setQueryData(["users.me"], () => null);
    context.setQueryData(["rooms.findMyRoom"], () => []);
    context.setQueryData(["favorited-rooms.findMyFavorites"], () => []);
    context.setQueryData(["favorited-rooms.isRoomFavorited"], () => false);
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
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export const useMe = () => useContext(AuthContext);
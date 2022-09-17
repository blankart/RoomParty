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
  refetch: ReturnType<typeof useQueryUsersMe>["refetch"];
}

export const AuthContext = createContext<AuthContextState>({
  user: undefined,
  error: null,
  isLoading: false,
  refetch: async () => ({} as any),
});

export function AuthContextProvider(props: { children?: React.ReactNode }) {
  const router = useRouter();
  const [hasAccessToken, setHasAccessToken] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const accessToken = router.query.token as string;
    const accessTokenFromCookie = parseCookies(null)[ACCESS_TOKEN_KEY];

    if (accessTokenFromCookie) {
      if (accessToken === accessTokenFromCookie) {
        setHasAccessToken(true);
      } else if (accessToken) {
        setCookie(null, ACCESS_TOKEN_KEY, accessToken, { path: "/" });
        setHasAccessToken(true);
      } else {
        setHasAccessToken(true);
      }

      return;
    } else if (accessToken) {
      setCookie(null, ACCESS_TOKEN_KEY, accessToken, { path: "/" });
      setHasAccessToken(true);
      return;
    }
  }, [router.isReady, router.query.token]);

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = trpc.useQuery(["users.me"], {
    enabled: hasAccessToken && !!parseCookies(null)[ACCESS_TOKEN_KEY],
    onError() {
      destroyCookie(null, ACCESS_TOKEN_KEY, { path: "/" });
      setHasAccessToken(false);
    },
  });

  return (
    <AuthContext.Provider value={{ user, error, isLoading, refetch }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useMe = () => useContext(AuthContext);

import { trpc } from "@web/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { ACCESS_TOKEN_KEY } from "common-types";

export default function useMe() {
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

  const { data: user, error, isLoading, refetch } = trpc.useQuery(["users.me"], {
    enabled: hasAccessToken && !!parseCookies(null)[ACCESS_TOKEN_KEY],
    refetchOnWindowFocus: false,
    onError() {
      destroyCookie(null, ACCESS_TOKEN_KEY, { path: "/" });
      setHasAccessToken(false);
    },
  });

  return { user, error, isLoading, refetch };
}

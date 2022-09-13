import { trpc } from "@web/api";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";
import { setCookie, parseCookies } from "nookies";
import { ACCESS_TOKEN_KEY } from "trpc";

export function initWebClient(state?: string) {
  window.googleClient = google.accounts.oauth2.initCodeClient({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_ID!,
    scope: "https://www.googleapis.com/auth/userinfo.profile",
    ux_mode: "redirect",
    redirect_uri: process.env.NEXT_PUBLIC_SERVER_URL! + "/oauth/google",
    state,
  });
}

export function NextGoogleOAuth() {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!window.google || !initialized) return;
    initWebClient(process.env.NEXT_PUBLIC_WEB_BASE_URL! + router.pathname);
  }, [router.pathname, initialized]);

  return (
    <Script
      defer
      async
      src="https://accounts.google.com/gsi/client"
      onLoad={() => {
        initWebClient();
        setInitialized(true);
      }}
    />
  );
}

export function NextGoogleOAuthHandler() {
  const router = useRouter();
  const [hasAccessToken, setHasAccessToken] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const accessToken = router.query.token as string;
    const accessTokenFromCookie = parseCookies(null)[ACCESS_TOKEN_KEY];

    if (accessTokenFromCookie && accessTokenFromCookie === accessToken) {
      if (accessToken === accessTokenFromCookie) {
        setHasAccessToken(true);
      } else if (accessToken) {
        setCookie(null, ACCESS_TOKEN_KEY, accessToken);
        setHasAccessToken(true);
      }

      return;
    }

    if (!accessTokenFromCookie && accessToken) {
      setCookie(null, ACCESS_TOKEN_KEY, accessToken);
      setHasAccessToken(true);
      return;
    }
  }, [router.isReady]);

  const { data, error, isLoading } = trpc.useQuery(["users.me"], {
    enabled: hasAccessToken,
  });

  console.log({ data, error, hasAccessToken, isLoading });

  return null;
}

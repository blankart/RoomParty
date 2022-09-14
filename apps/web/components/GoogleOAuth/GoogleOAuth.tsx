import { ACCESS_TOKEN_KEY } from "common-types";
import { trpc } from "@web/api";
import { useRouter } from "next/router";
import Script from "next/script";
import { setCookie } from "nookies";
import { useEffect, useState } from "react";

interface TokenClientCallback {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export function NextGoogleOAuth() {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  const { data: isSuccess, mutate: googleOAuthWithToken } = trpc.useMutation(
    ["users.googleOAuthWithToken"],
    {
      onSuccess(data, variables) {
        if (data)
          setCookie(null, ACCESS_TOKEN_KEY, variables.access_token, {
            path: "/",
          });
        router.reload();
      },
    }
  );

  trpc.useQuery(["users.me"], {
    enabled: isSuccess,
    refetchOnWindowFocus: false,
  });

  function initWebClient(state?: string) {
    window.googleClient = google.accounts.oauth2.initTokenClient({
      scope: "https://www.googleapis.com/auth/userinfo.profile",
      client_id: process.env.NEXT_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_ID!,
      state,
      callback(t) {
        const tokenResponse = t as unknown as TokenClientCallback;
        googleOAuthWithToken(tokenResponse);
      },
    });
  }

  useEffect(() => {
    if (!window.google || !initialized) return;
    initWebClient(process.env.NEXT_PUBLIC_WEB_BASE_URL! + router.pathname);
  }, [router.pathname, initialized]);

  return (
    <>
      <Script
        defer
        async
        src="https://accounts.google.com/gsi/client"
        onLoad={() => {
          initWebClient();
          setInitialized(true);
        }}
      />
    </>
  );
}

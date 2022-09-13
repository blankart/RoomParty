import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";

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

import "@web/styles/global.css";
import { withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";
import DashboardLayout from "@web/components/DashboardLayout/DashboardLayout";
import { AuthContextProvider } from "@web/context/AuthContext";
import Toast from "./components/Toast";
import { APP_NAME } from "@RoomParty/shared-lib";
import { NextSeo } from "next-seo";
import Head from "next/head";

function App({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        <link rel="manifest" href="/site.webmanifest" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
      <NextSeo
        title={APP_NAME}
        openGraph={{
          title: APP_NAME,
        }}
      />
      <AuthContextProvider>
        <Toast />
        <ThemeProvider
          defaultTheme="system"
          forcedTheme={(Component as any).forcedTheme || undefined}
        >
          <DashboardLayout>
            <Component {...pageProps} />
          </DashboardLayout>
        </ThemeProvider>
      </AuthContextProvider>
    </>
  );
}

export default withTRPC(App);

import "@web/styles/global.css";
import { withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";
import DashboardLayout from "@web/components/DashboardLayout/DashboardLayout";
import { AuthContextProvider } from "@web/context/AuthContext";
import Toast from "./components/Toast";
import { APP_NAME } from "@RoomParty/shared-lib";
import { NextSeo } from "next-seo";

function App({ Component, pageProps }: any) {
  return (
    <>
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

import "@web/styles/global.css";
import { withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";
import DashboardLayout from "@web/components/DashboardLayout/DashboardLayout";
import { AuthContextProvider } from "@web/context/AuthContext";

function App({ Component, pageProps }: any) {
  return (
    <>
      <AuthContextProvider>
        <ThemeProvider
          forcedTheme={(Component as any).theme || "dark"}
          attribute="class"
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

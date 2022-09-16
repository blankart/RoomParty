import "@web/styles/global.css";
import { withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";
import DashboardLayout from "@web/components/DashboardLayout/DashboardLayout";

function App({ Component, pageProps }: any) {
  return (
    <>
      <ThemeProvider
        forcedTheme={(Component as any).theme || "dark"}
        attribute="class"
      >
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </ThemeProvider>
    </>
  );
}

export default withTRPC(App);

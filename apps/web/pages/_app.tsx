import "@web/styles/global.css";
import { withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";

function App({ Component, pageProps }: any) {
  return (
    <>
      <ThemeProvider
        forcedTheme={(Component as any).thene || undefined}
        attribute="class"
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default withTRPC(App);

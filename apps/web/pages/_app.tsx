import "@web/styles/global.css";
import NextApp from "next/app";
import { TRPCProvider, withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";
import {
  NextGoogleOAuth,
  NextGoogleOAuthHandler,
} from "@web/components/GoogleOAuth/GoogleOAuth";

class App extends NextApp {
  componentDidCatch(error: Error): void {
    throw error;
  }
  render(): JSX.Element {
    const { Component, pageProps } = this.props;

    return (
      <>
        <NextGoogleOAuth />
        <ThemeProvider
          forcedTheme={(Component as any).thene || undefined}
          attribute="class"
        >
          <TRPCProvider>
            <NextGoogleOAuthHandler />
            <Component {...pageProps} />
          </TRPCProvider>
        </ThemeProvider>
      </>
    );
  }
}

export default withTRPC(App);

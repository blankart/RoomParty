import "@web/styles/global.css";
import NextApp, { AppContext, AppInitialProps } from "next/app";
import { TRPCProvider, withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";
import { NextGoogleOAuth } from "@web/components/GoogleOAuth/GoogleOAuth";

class App extends NextApp {
  static getInitialProps: ({
    Component,
    ctx,
  }: AppContext) => Promise<AppInitialProps> = async ({ ctx }) => {
    return { pageProps: {} };
  };

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
            <Component {...pageProps} />
          </TRPCProvider>
        </ThemeProvider>
      </>
    );
  }
}

export default withTRPC(App);

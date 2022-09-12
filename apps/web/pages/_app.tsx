import "@web/styles/global.css";
import NextApp from "next/app";
import { TRPCProvider, withTRPC } from "@web/api";
import { ThemeProvider } from "next-themes";

class App extends NextApp {
  componentDidCatch(error: Error): void {}
  render(): JSX.Element {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider
        forcedTheme={(Component as any).thene || undefined}
        attribute="class"
      >
        <TRPCProvider>
          <Component {...pageProps} />
        </TRPCProvider>
      </ThemeProvider>
    );
  }
}

export default withTRPC(App);

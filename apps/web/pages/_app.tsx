import "@web/styles/global.css";
import NextApp from "next/app";
import { TRPCProvider, withTRPC } from "@web/api";

class App extends NextApp {
  componentDidCatch(error: Error): void {}
  render(): JSX.Element {
    const { Component, pageProps } = this.props;
    return (
      <TRPCProvider>
        <Component {...pageProps} />
      </TRPCProvider>
    );
  }
}

export default withTRPC(App);

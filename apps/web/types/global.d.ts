import type { CustomProcessEnv } from "@partyfy/shared-lib/types/env";
import type GoogleAccounts from "google.accounts";
import type GApi from "gapi";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CustomProcessEnv { }
  }

  const google: GoogleAccounts;

  const gapi: GApi;

  interface Window {
    googleClient: google.accounts.oauth2.TokenClient | undefined;
  }
}

export { };

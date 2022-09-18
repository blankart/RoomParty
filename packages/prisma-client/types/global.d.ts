import { CustomProcessEnv } from "@rooms2watch/shared-lib";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CustomProcessEnv {}
  }
}

export {};

import { CustomProcessEnv } from "common-types/env";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CustomProcessEnv {}
  }
}

export {};

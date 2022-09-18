import type { CustomProcessEnv } from "@rooms2watch/shared-lib/types/env";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CustomProcessEnv {}
  }
}

export {};

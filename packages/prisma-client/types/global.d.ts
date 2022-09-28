import type { CustomProcessEnv } from "@partyfy/shared-lib/types/env";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CustomProcessEnv { }
  }
}

export { };

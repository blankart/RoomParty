import type { CustomProcessEnv } from "@RoomParty/shared-lib/types/env";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CustomProcessEnv {}
  }
}

export {};

import { CustomProcessEnv } from "@rooms2watch/common-types";

declare global {
    namespace NodeJS {
        interface ProcessEnv extends CustomProcessEnv { }
    }
}

export { };

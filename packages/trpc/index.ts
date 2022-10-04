export { createRootRouter } from "./src";
export { createContext } from "./src/trpc/trpc";

export type { AppRouter } from "./src";
export type { PlayerStatus } from "./src/types/player";
export type { TemporaryChat } from "./src/types/temporary-chat";

import "./src/modules/discord/discord.service";

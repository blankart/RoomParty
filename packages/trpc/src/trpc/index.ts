import appContainer from "../container/container";
import { TRPC_ROUTES } from "../types/container";
import TRPCRoutes from "./routes";

export function createRootRouter() {
  return appContainer.get<TRPCRoutes>(TRPC_ROUTES).createRootRouter();
}

export type AppRouter = ReturnType<typeof createRootRouter>;

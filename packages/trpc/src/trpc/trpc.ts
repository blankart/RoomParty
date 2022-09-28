import { JwtVerifier } from "@RoomParty/auth-providers";
import appContainer from "../container/container";
import { TRPC_ROUTER } from "../types/container";
import TRPCRouter from "./router";

export const createContext = (jwt: JwtVerifier) =>
  appContainer.get<TRPCRouter>(TRPC_ROUTER).createContext(jwt);
export const createRouter = () =>
  appContainer.get<TRPCRouter>(TRPC_ROUTER).createRouter();
export const createRouterWithUser = () =>
  appContainer.get<TRPCRouter>(TRPC_ROUTER).createRouterWithUser();
export const createProtectedRouter = () =>
  appContainer.get<TRPCRouter>(TRPC_ROUTER).createProtectedRouter();

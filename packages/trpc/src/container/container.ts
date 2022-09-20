import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { makeLoggerMiddleware } from "inversify-logger-middleware";
import ChatsController from "../modules/chats/chats.controller";
import ChatsService from "../modules/chats/chats.service";
import FavoritedRoomsController from "../modules/favorited-rooms/favorited-rooms.controller";
import FavoritedRoomsService from "../modules/favorited-rooms/favorited-rooms.service";
import ModelsService from "../modules/models/models.service";
import PlayerController from "../modules/player/player.controller";
import PlayerService from "../modules/player/player.service";
import QueueService from "../modules/queue/queue.service";
import RoomsController from "../modules/rooms/rooms.controller";
import RoomsService from "../modules/rooms/rooms.service";
import UsersController from "../modules/users/users.controller";
import UsersService from "../modules/users/users.service";
import YoutubeController from "../modules/youtube/youtube.controller";
import YoutubeService from "../modules/youtube/youtube.service";
import TRPCRouter from "../trpc/router";
import TRPCRoutes from "../trpc/routes";
import {
  CONTROLLER_TYPES,
  EMITTER_TYPES,
  ROUTER_TYPES,
  SERVICES_TYPES,
  TRPC_ROUTER,
  TRPC_ROUTES,
} from "../types/container";
import RoomsRouter from "../modules/rooms/rooms.router";
import ChatsRouter from "../modules/chats/chats.router";
import PlayerRouter from "../modules/player/player.router";
import FavoritedRoomsRouter from "../modules/favorited-rooms/favorited-rooms.router";
import UsersRouter from "../modules/users/users.router";
import YoutubeRouter from "../modules/youtube/youtube.router";
import EmitterService from "../modules/emitter/emitter.service";
import ChatsEmitter from "../modules/chats/chats.emitter";
import PlayerEmitter from "../modules/player/player.emitter";

const trpcContainerModule = new ContainerModule(bind => {
  /**
   * Injected Services
   */
  bind<RoomsService>(SERVICES_TYPES.Rooms)
    .to(RoomsService)
    .inSingletonScope();

  bind<ChatsService>(SERVICES_TYPES.Chats)
    .to(ChatsService)
    .inSingletonScope();

  bind<PlayerService>(SERVICES_TYPES.Player)
    .to(PlayerService)
    .inSingletonScope();

  bind<FavoritedRoomsService>(SERVICES_TYPES.FavoritedRooms)
    .to(FavoritedRoomsService)
    .inSingletonScope();

  bind<ModelsService>(SERVICES_TYPES.Models)
    .to(ModelsService)
    .inSingletonScope();

  bind<QueueService>(SERVICES_TYPES.Queue)
    .to(QueueService)
    .inSingletonScope();

  bind<UsersService>(SERVICES_TYPES.Users)
    .to(UsersService)
    .inSingletonScope();

  bind<YoutubeService>(SERVICES_TYPES.Youtube)
    .to(YoutubeService)
    .inSingletonScope();

  bind<EmitterService>(SERVICES_TYPES.Emitter)
    .to(EmitterService)
    .inSingletonScope();

  /**
   * Injected Emitters
   */

  bind<ChatsEmitter>(EMITTER_TYPES.Chats)
    .to(ChatsEmitter)
    .inSingletonScope();

  bind<PlayerEmitter>(EMITTER_TYPES.Player)
    .to(PlayerEmitter)
    .inSingletonScope();

  /**
   * Injected Controller
   */

  bind<RoomsController>(CONTROLLER_TYPES.Rooms)
    .to(RoomsController)
    .inSingletonScope();

  bind<ChatsController>(CONTROLLER_TYPES.Chats)
    .to(ChatsController)
    .inSingletonScope();

  bind<PlayerController>(CONTROLLER_TYPES.Player)
    .to(PlayerController)
    .inSingletonScope();

  bind<FavoritedRoomsController>(CONTROLLER_TYPES.FavoritedRooms)
    .to(FavoritedRoomsController)
    .inSingletonScope();

  bind<UsersController>(CONTROLLER_TYPES.Users)
    .to(UsersController)
    .inSingletonScope();

  bind<YoutubeController>(CONTROLLER_TYPES.Youtube)
    .to(YoutubeController)
    .inRequestScope();

  /**
   * Injected Routes
   */

  bind<RoomsRouter>(ROUTER_TYPES.Rooms)
    .to(RoomsRouter)
    .inSingletonScope();

  bind<ChatsRouter>(ROUTER_TYPES.Chats)
    .to(ChatsRouter)
    .inSingletonScope();

  bind<PlayerRouter>(ROUTER_TYPES.Player)
    .to(PlayerRouter)
    .inSingletonScope();

  bind<FavoritedRoomsRouter>(ROUTER_TYPES.FavoritedRooms)
    .to(FavoritedRoomsRouter)
    .inSingletonScope();

  bind<UsersRouter>(ROUTER_TYPES.Users)
    .to(UsersRouter)
    .inSingletonScope();

  bind<YoutubeRouter>(ROUTER_TYPES.Youtube)
    .to(YoutubeRouter)
    .inRequestScope();

  /**
   * Injected TRPCRoutes
   */
  bind<TRPCRoutes>(TRPC_ROUTES).to(TRPCRoutes).inSingletonScope();

  /**
   * Injected TRPCRouter
   */
  bind<TRPCRouter>(TRPC_ROUTER).to(TRPCRouter).inSingletonScope();
})


const appContainer = new Container();

if (process.env.NODE_ENV !== "production") {
  appContainer.applyMiddleware(makeLoggerMiddleware());
}

appContainer.load(trpcContainerModule)

export default appContainer;
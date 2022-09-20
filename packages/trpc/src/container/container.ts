import "reflect-metadata";
import { Container } from "inversify";
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
    SERVICES_TYPES,
    TRPC_ROUTER,
    TRPC_ROUTES,
} from "../types/container";

const appContainer = new Container();

/**
 * Injected Services
 */
appContainer.bind<RoomsService>(SERVICES_TYPES.Rooms).to(RoomsService).inSingletonScope();
appContainer.bind<ChatsService>(SERVICES_TYPES.Chats).to(ChatsService).inSingletonScope();
appContainer.bind<PlayerService>(SERVICES_TYPES.Player).to(PlayerService).inSingletonScope();
appContainer
    .bind<FavoritedRoomsService>(SERVICES_TYPES.FavoritedRooms)
    .to(FavoritedRoomsService).inSingletonScope();
appContainer
    .bind<ModelsService>(SERVICES_TYPES.Models)
    .to(ModelsService).inSingletonScope();
appContainer
    .bind<QueueService>(SERVICES_TYPES.Queue)
    .to(QueueService).inSingletonScope();
appContainer
    .bind<UsersService>(SERVICES_TYPES.Users)
    .to(UsersService).inSingletonScope();
appContainer
    .bind<YoutubeService>(SERVICES_TYPES.Youtube)
    .to(YoutubeService).inSingletonScope();

/**
 * Injected Controller
 */
appContainer.bind<RoomsController>(CONTROLLER_TYPES.Rooms).to(RoomsController).inSingletonScope();
appContainer.bind<ChatsController>(CONTROLLER_TYPES.Chats).to(ChatsController).inSingletonScope();
appContainer
    .bind<PlayerController>(CONTROLLER_TYPES.Player)
    .to(PlayerController).inSingletonScope();
appContainer
    .bind<FavoritedRoomsController>(CONTROLLER_TYPES.FavoritedRooms)
    .to(FavoritedRoomsController).inSingletonScope();
appContainer
    .bind<UsersController>(CONTROLLER_TYPES.Users)
    .to(UsersController).inSingletonScope();
appContainer
    .bind<YoutubeController>(CONTROLLER_TYPES.Youtube)
    .to(YoutubeController).inRequestScope();

/**
 * Injected TRPCRoutes
 */
appContainer.bind<TRPCRoutes>(TRPC_ROUTES).to(TRPCRoutes).inSingletonScope();

/**
 * Injected TRPCRouter
 */
appContainer.bind<TRPCRouter>(TRPC_ROUTER).to(TRPCRouter).inSingletonScope();

export default appContainer;
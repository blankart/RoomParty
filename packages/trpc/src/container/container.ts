import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
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
import RoomsEmitter from "../modules/rooms/rooms.emitter";
import VideoChatEmitter from "../modules/video-chat/video-chat.emitter";
import VideoChatController from "../modules/video-chat/video-chat.controller";
import VideoChatRouter from "../modules/video-chat/video-chat.router";
import TemporaryChatsEmitter from "../modules/temporary-chats/temporary-chats.emitter";
import TemporaryChatsController from "../modules/temporary-chats/temporary-chats.controller";
import TemporaryChatsRouter from "../modules/temporary-chats/temporary-chats.router";
import DiscordService from "../modules/discord/discord.service";

const trpcContainerModule = new ContainerModule((bind) => {
  /**
   * Injected Services
   */
  bind<RoomsService>(SERVICES_TYPES.Rooms).to(RoomsService).inSingletonScope();

  bind<ChatsService>(SERVICES_TYPES.Chats).to(ChatsService).inSingletonScope();

  bind<PlayerService>(SERVICES_TYPES.Player)
    .to(PlayerService)
    .inSingletonScope();

  bind<FavoritedRoomsService>(SERVICES_TYPES.FavoritedRooms)
    .to(FavoritedRoomsService)
    .inSingletonScope();

  bind<ModelsService>(SERVICES_TYPES.Models)
    .to(ModelsService)
    .inSingletonScope();

  bind<QueueService>(SERVICES_TYPES.Queue).to(QueueService).inSingletonScope();

  bind<UsersService>(SERVICES_TYPES.Users).to(UsersService).inSingletonScope();

  bind<YoutubeService>(SERVICES_TYPES.Youtube)
    .to(YoutubeService)
    .inSingletonScope();

  bind<EmitterService>(SERVICES_TYPES.Emitter)
    .to(EmitterService)
    .inSingletonScope();

  bind<DiscordService>(SERVICES_TYPES.Discord)
    .to(DiscordService)
    .inSingletonScope();

  /**
   * Injected Emitters
   */

  bind<ChatsEmitter>(EMITTER_TYPES.Chats).to(ChatsEmitter).inSingletonScope();
  bind<RoomsEmitter>(EMITTER_TYPES.Rooms).to(RoomsEmitter).inSingletonScope();

  bind<PlayerEmitter>(EMITTER_TYPES.Player)
    .to(PlayerEmitter)
    .inSingletonScope();

  bind<VideoChatEmitter>(EMITTER_TYPES.VideoChat)
    .to(VideoChatEmitter)
    .inSingletonScope();

  bind<TemporaryChatsEmitter>(EMITTER_TYPES.TemporaryChats)
    .to(TemporaryChatsEmitter)
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
    .inSingletonScope();

  bind<VideoChatController>(CONTROLLER_TYPES.VideoChat)
    .to(VideoChatController)
    .inSingletonScope();

  bind<TemporaryChatsController>(CONTROLLER_TYPES.TemporaryChats)
    .to(TemporaryChatsController)
    .inSingletonScope();

  /**
   * Injected Routes
   */

  bind<RoomsRouter>(ROUTER_TYPES.Rooms).to(RoomsRouter).inSingletonScope();

  bind<ChatsRouter>(ROUTER_TYPES.Chats).to(ChatsRouter).inSingletonScope();

  bind<PlayerRouter>(ROUTER_TYPES.Player).to(PlayerRouter).inSingletonScope();

  bind<FavoritedRoomsRouter>(ROUTER_TYPES.FavoritedRooms)
    .to(FavoritedRoomsRouter)
    .inSingletonScope();

  bind<UsersRouter>(ROUTER_TYPES.Users).to(UsersRouter).inSingletonScope();

  bind<YoutubeRouter>(ROUTER_TYPES.Youtube)
    .to(YoutubeRouter)
    .inSingletonScope();

  bind<VideoChatRouter>(ROUTER_TYPES.VideoChat)
    .to(VideoChatRouter)
    .inSingletonScope();

  bind<TemporaryChatsRouter>(ROUTER_TYPES.TemporaryChats)
    .to(TemporaryChatsRouter)
    .inSingletonScope();

  /**
   * Injected TRPCRoutes
   */
  bind<TRPCRoutes>(TRPC_ROUTES).to(TRPCRoutes).inSingletonScope();

  /**
   * Injected TRPCRouter
   */
  bind<TRPCRouter>(TRPC_ROUTER).to(TRPCRouter).inSingletonScope();
});

const appContainer = new Container();

appContainer.load(trpcContainerModule);

export default appContainer;

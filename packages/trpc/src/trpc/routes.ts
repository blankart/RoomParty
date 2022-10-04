import { injectable, inject } from "inversify";
import ChatsRouter, { CHATS_ROUTER_NAME } from "../modules/chats/chats.router";
import FavoritedRoomsRouter, {
  FAVORITED_ROOMS_ROUTER_NAME,
} from "../modules/favorited-rooms/favorited-rooms.router";
import PlayerRouter, {
  PLAYER_ROUTER_NAME,
} from "../modules/player/player.router";
import RoomsRouter, { ROOMS_ROUTER_NAME } from "../modules/rooms/rooms.router";
import UsersRouter, { USERS_ROUTER_NAME } from "../modules/users/users.router";
import YoutubeRouter, {
  YOUTUBE_ROUTER_NAME,
} from "../modules/youtube/youtube.router";
import { ROUTER_TYPES, TRPC_ROUTER } from "../types/container";
import superjson from "superjson";
import TRPCRouter from "./router";
import VideoChatRouter, {
  VIDEO_CHAT_ROUTER_NAME,
} from "../modules/video-chat/video-chat.router";
import TemporaryChatsRouter, {
  TEMPORARY_CHATS_ROUTER_NAME,
} from "../modules/temporary-chats/temporary-chats.router";

@injectable()
class TRPCRoutes {
  constructor(
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter,
    @inject(ROUTER_TYPES.Rooms) private roomsRouter: RoomsRouter,
    @inject(ROUTER_TYPES.Chats) private chatsRouter: ChatsRouter,
    @inject(ROUTER_TYPES.Player) private playerRouter: PlayerRouter,
    @inject(ROUTER_TYPES.Users) private usersRouter: UsersRouter,
    @inject(ROUTER_TYPES.Youtube) private youtubeRouter: YoutubeRouter,
    @inject(ROUTER_TYPES.VideoChat) private videoChatRouter: VideoChatRouter,
    @inject(ROUTER_TYPES.FavoritedRooms)
    private favoritedRoomsRouter: FavoritedRoomsRouter,
    @inject(ROUTER_TYPES.TemporaryChats)
    private temporaryChatsRouter: TemporaryChatsRouter
  ) {}
  private routeNameForMerge<T extends string>(route: T): `${T}.` {
    return (route + ".") as `${T}.`;
  }

  createRootRouter() {
    return this.trpcRouter
      .createRouter()
      .transformer(superjson)
      .merge(
        this.routeNameForMerge(ROOMS_ROUTER_NAME),
        this.roomsRouter.router()
      )
      .merge(
        this.routeNameForMerge(ROOMS_ROUTER_NAME),
        this.roomsRouter.protectedRouter()
      )
      .merge(
        this.routeNameForMerge(ROOMS_ROUTER_NAME),
        this.roomsRouter.routerWithUser()
      )

      .merge(
        this.routeNameForMerge(CHATS_ROUTER_NAME),
        this.chatsRouter.router()
      )
      .merge(
        this.routeNameForMerge(CHATS_ROUTER_NAME),
        this.chatsRouter.routerWithUser()
      )

      .merge(
        this.routeNameForMerge(PLAYER_ROUTER_NAME),
        this.playerRouter.router()
      )

      .merge(
        this.routeNameForMerge(FAVORITED_ROOMS_ROUTER_NAME),
        this.favoritedRoomsRouter.protectedRouter()
      )

      .merge(
        this.routeNameForMerge(USERS_ROUTER_NAME),
        this.usersRouter.router()
      )
      .merge(
        this.routeNameForMerge(USERS_ROUTER_NAME),
        this.usersRouter.protectedRouter()
      )

      .merge(
        this.routeNameForMerge(YOUTUBE_ROUTER_NAME),
        this.youtubeRouter.router()
      )

      .merge(
        this.routeNameForMerge(VIDEO_CHAT_ROUTER_NAME),
        this.videoChatRouter.routerWithUser()
      )

      .merge(
        this.routeNameForMerge(TEMPORARY_CHATS_ROUTER_NAME),
        this.temporaryChatsRouter.routerWithUser()
      )

      .merge(
        this.routeNameForMerge(TEMPORARY_CHATS_ROUTER_NAME),
        this.temporaryChatsRouter.router()
      );
  }
}

export default TRPCRoutes;

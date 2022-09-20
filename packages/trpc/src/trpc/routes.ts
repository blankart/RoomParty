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

@injectable()
class TRPCRoutes {
  constructor(
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter,
    @inject(ROUTER_TYPES.Rooms) private roomsRouter: RoomsRouter,
    @inject(ROUTER_TYPES.Chats) private chatsRouter: ChatsRouter,
    @inject(ROUTER_TYPES.Player) private playerRouter: PlayerRouter,
    @inject(ROUTER_TYPES.Users) private usersRouter: UsersRouter,
    @inject(ROUTER_TYPES.Youtube) private youtubeRouter: YoutubeRouter,
    @inject(ROUTER_TYPES.FavoritedRooms)
    private favoritedRoomsController: FavoritedRoomsRouter
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
        this.favoritedRoomsController.protectedRouter()
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
      );
  }
}

export default TRPCRoutes;

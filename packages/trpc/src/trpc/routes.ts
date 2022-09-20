import { injectable, inject } from "inversify";
import ChatsController, {
  CHATS_ROUTER_NAME,
} from "../modules/chats/chats.controller";
import FavoritedRoomsController, {
  FAVORITED_ROOMS_ROUTER_NAME,
} from "../modules/favorited-rooms/favorited-rooms.controller";
import PlayerController, {
  PLAYER_ROUTER_NAME,
} from "../modules/player/player.controller";
import RoomsController, {
  ROOMS_ROUTER_NAME,
} from "../modules/rooms/rooms.controller";
import UsersController, { USERS_ROUTER_NAME } from "../modules/users/users.controller";
import YoutubeController, { YOUTUBE_ROUTER_NAME } from "../modules/youtube/youtube.controller";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../types/container";
import superjson from "superjson";
import TRPCRouter from "./router";

@injectable()
class TRPCRoutes {
  constructor(
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter,
    @inject(CONTROLLER_TYPES.Rooms) private roomsController: RoomsController,
    @inject(CONTROLLER_TYPES.Chats) private chatsController: ChatsController,
    @inject(CONTROLLER_TYPES.Player) private playerController: PlayerController,
    @inject(CONTROLLER_TYPES.Users) private usersController: UsersController,
    @inject(CONTROLLER_TYPES.Youtube) private youtubeController: YoutubeController,
    @inject(CONTROLLER_TYPES.FavoritedRooms)
    private favoritedRoomsController: FavoritedRoomsController
  ) {

  }
  private routeNameForMerge<T extends string>(route: T): `${T}.` {
    return (route + ".") as `${T}.`;
  }

  createRootRouter() {
    return this.trpcRouter.createRouter()
      .transformer(superjson)
      .merge(
        this.routeNameForMerge(ROOMS_ROUTER_NAME),
        this.roomsController.router()
      )
      .merge(
        this.routeNameForMerge(ROOMS_ROUTER_NAME),
        this.roomsController.protectedRouter()
      )
      .merge(
        this.routeNameForMerge(ROOMS_ROUTER_NAME),
        this.roomsController.routerWithUser()
      )

      .merge(
        this.routeNameForMerge(CHATS_ROUTER_NAME),
        this.chatsController.router()
      )
      .merge(
        this.routeNameForMerge(CHATS_ROUTER_NAME),
        this.chatsController.routerWithUser()
      )

      .merge(
        this.routeNameForMerge(PLAYER_ROUTER_NAME),
        this.playerController.router()
      )

      .merge(
        this.routeNameForMerge(FAVORITED_ROOMS_ROUTER_NAME),
        this.favoritedRoomsController.protectedRouter()
      )

      .merge(this.routeNameForMerge(USERS_ROUTER_NAME), this.usersController.router())
      .merge(this.routeNameForMerge(USERS_ROUTER_NAME), this.usersController.protectedRouter())

      .merge(this.routeNameForMerge(YOUTUBE_ROUTER_NAME), this.youtubeController.router())
  }
}

export default TRPCRoutes;

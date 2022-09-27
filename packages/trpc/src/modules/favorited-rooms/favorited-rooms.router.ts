import { inject, injectable } from "inversify";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import type TRPCRouter from "../../trpc/router";
import type FavoritedRoomsController from "./favorited-rooms.controller";
import { isRoomFavoritedSchema, toggleSchema } from "./favorited-rooms.schema";

export const FAVORITED_ROOMS_ROUTER_NAME = "favorited-rooms";

@injectable()
class FavoritedRoomsRouter {
  constructor(
    @inject(CONTROLLER_TYPES.FavoritedRooms)
    private favoritedRoomsController: FavoritedRoomsController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) {}

  protectedRouter() {
    const self = this;
    return this.trpcRouter
      .createProtectedRouter()
      .mutation("toggle", {
        input: toggleSchema,
        async resolve({ input, ctx }) {
          return await self.favoritedRoomsController.toggle(input, ctx.user);
        },
      })

      .query("isRoomFavorited", {
        input: isRoomFavoritedSchema,
        async resolve({ input, ctx }) {
          return await self.favoritedRoomsController.isRoomFavorited(
            input,
            ctx.user
          );
        },
      })

      .query("findMyFavorites", {
        async resolve({ ctx }) {
          return await self.favoritedRoomsController.findMyFavorites(ctx.user);
        },
      });
  }
}

export default FavoritedRoomsRouter;

import zod from "zod";
import FavoritedRoomsService from "./favorited-rooms.service";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES, TRPC_ROUTER } from "../../types/container";
import TRPCRouter from "../../trpc/router";

export const FAVORITED_ROOMS_ROUTER_NAME = "favorited-rooms";

@injectable()
class FavoritedRoomsController {
  constructor(
    @inject(SERVICES_TYPES.FavoritedRooms)
    private favoritedRoomsService: FavoritedRoomsService,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) { }

  protectedRouter() {
    const self = this;
    return this.trpcRouter.createProtectedRouter()
      .mutation("toggle", {
        input: zod.object({
          roomId: zod.string(),
        }),
        async resolve({ input, ctx }) {
          return await self.favoritedRoomsService.toggle(input, ctx.user);
        },
      })

      .query("isRoomFavorited", {
        input: zod.object({
          roomId: zod.string(),
        }),
        async resolve({ input, ctx }) {
          return await self.favoritedRoomsService.isRoomFavorited(
            input,
            ctx.user
          );
        },
      })

      .query("findMyFavorites", {
        async resolve({ ctx }) {
          return await self.favoritedRoomsService.findMyFavorites(ctx.user);
        },
      });
  }
}

export default FavoritedRoomsController;

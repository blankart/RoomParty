import { createProtectedRouter } from "../../trpc";
import zod from "zod";
import FavoritedRoomsService from "./favorited-rooms.service";

export const FAVORITED_ROOMS_ROUTER_NAME = "favorited-rooms";

export const favoritedRoomsProtectedRouter = createProtectedRouter()
    .mutation('toggle', {
        input: zod.object({
            roomId: zod.string()
        }),
        async resolve({ input, ctx }) {
            return await FavoritedRoomsService.toggle(input, ctx.user)
        }
    })

    .query('isRoomFavorited', {
        input: zod.object({
            roomId: zod.string()
        }),
        async resolve({ input, ctx }) {
            return await FavoritedRoomsService.isRoomFavorited(input, ctx.user)
        }
    })

    .query('findMyFavorites', {
        async resolve({ ctx }) {
            return await FavoritedRoomsService.findMyFavorites(ctx.user)
        }
    })
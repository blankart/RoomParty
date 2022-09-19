import {
  createProtectedRouter,
  createRouter,
  createRouterWithUser,
} from "../../trpc";
import RoomsService from "./rooms.service";
import { TRPCError } from "@trpc/server";
import {
  createSchema,
  deleteMyRoomSchema,
  findByRoomIdentificationIdSchema,
  getOnlineInfoSchema,
} from "./rooms.schema";

export const ROOMS_ROUTER_NAME = "rooms";

export const roomsRouter = createRouter()
  .query("findByRoomIdentificationId", {
    input: findByRoomIdentificationIdSchema,
    async resolve({ input }) {
      return await RoomsService.findByRoomIdentificationId(input);
    },
  })
  .query("getOnlineInfo", {
    input: getOnlineInfoSchema,
    async resolve({ input }) {
      return await RoomsService.getOnlineInfoByRoomIdentificationid(input);
    },
  });

export const roomsProtectedRouter = createProtectedRouter()
  .query("findMyRoom", {
    async resolve({ ctx }) {
      return RoomsService.findMyRoom(ctx.user.id);
    },
  })
  .mutation("deleteMyRoom", {
    input: deleteMyRoomSchema,
    async resolve({ input, ctx }) {
      return RoomsService.deleteMyRoom(input, ctx.user);
    },
  });

export const roomsWithUserRouter = createRouterWithUser().mutation("create", {
  input: createSchema,
  async resolve({ input, ctx }) {
    try {
      return await RoomsService.create(input, ctx.user);
    } catch (e) {
      throw new TRPCError({
        message: e as any,
        code: "BAD_REQUEST",
      });
    }
  },
});

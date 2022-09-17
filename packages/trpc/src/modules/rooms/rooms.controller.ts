import {
  createProtectedRouter,
  createRouter,
  createRouterWithUser,
} from "../../trpc";
import zod from "zod";
import RoomsService from "./rooms.service";
import { TRPCError } from "@trpc/server";

export const ROOMS_ROUTER_NAME = "rooms";

export const roomsRouter = createRouter()
  .query("findById", {
    input: zod.string(),
    async resolve({ input }) {
      return await RoomsService.findById(input);
    },
  })
  .query("findByRoomIdentificationId", {
    input: zod.string(),
    async resolve({ input }) {
      return await RoomsService.findByRoomIdentificationId(input);
    },
  });

export const roomsProtectedRouter = createProtectedRouter()
  .query("findMyRoom", {
    async resolve({ ctx }) {
      return RoomsService.findMyRoom(ctx.user.id);
    },
  })
  .mutation("deleteMyRoom", {
    input: zod.string(),
    async resolve({ input, ctx }) {
      return RoomsService.deleteMyRoom(input, ctx.user);
    },
  });

export const roomsWithUserRouter = createRouterWithUser().mutation("create", {
  input: zod.object({
    name: zod.string(),
  }),
  async resolve({ input, ctx }) {
    try {
      return await RoomsService.create(input.name, ctx.user);
    } catch (e) {
      throw new TRPCError({
        message: e as any,
        code: "BAD_REQUEST",
      });
    }
  },
});

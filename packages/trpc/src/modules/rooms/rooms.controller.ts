import { TRPCError } from "@trpc/server";
import {
  createSchema,
  deleteMyRoomSchema,
  findByRoomIdentificationIdSchema,
  getOnlineInfoSchema,
} from "./rooms.schema";

import { injectable, inject } from "inversify";
import { SERVICES_TYPES, TRPC_ROUTER } from "../../types/container";
import type RoomsService from "./rooms.service";
import TRPCRouter from "../../trpc/router";

export const ROOMS_ROUTER_NAME = "rooms";

@injectable()
class RoomsController {
  constructor(
    @inject(SERVICES_TYPES.Rooms) private roomsService: RoomsService,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) { }
  router() {
    const self = this;
    return this.trpcRouter.createRouter()
      .query("findByRoomIdentificationId", {
        input: findByRoomIdentificationIdSchema,
        async resolve({ input }) {
          return await self.roomsService.findByRoomIdentificationId(input);
        },
      })
      .query("getOnlineInfo", {
        input: getOnlineInfoSchema,
        async resolve({ input }) {
          return await self.roomsService.getOnlineInfoByRoomIdentificationid(
            input
          );
        },
      });
  }

  protectedRouter() {
    const self = this;
    return this.trpcRouter.createProtectedRouter()
      .query("findMyRoom", {
        async resolve({ ctx }) {
          return self.roomsService.findMyRoom(ctx.user.id);
        },
      })
      .mutation("deleteMyRoom", {
        input: deleteMyRoomSchema,
        async resolve({ input, ctx }) {
          return self.roomsService.deleteMyRoom(input, ctx.user);
        },
      });
  }

  routerWithUser() {
    const self = this;

    return this.trpcRouter.createRouterWithUser().mutation("create", {
      input: createSchema,
      async resolve({ input, ctx }) {
        try {
          return await self.roomsService.create(input, ctx.user);
        } catch (e) {
          throw new TRPCError({
            message: e as any,
            code: "BAD_REQUEST",
          });
        }
      },
    });
  }
}

export default RoomsController;

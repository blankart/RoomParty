import {
  createSchema,
  deleteMyRoomSchema,
  findByRoomIdentificationIdSchema,
  getOnlineInfoSchema,
  getRoomInitialMetadataSchema,
  getSettingsSchema,
  requestForRoomTransientSchema,
  saveSettingsSchema,
  subscribeToRoomMetadataSchema,
  validatePasswordSchema,
} from "./rooms.schema";

import { injectable, inject } from "inversify";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import TRPCRouter from "../../trpc/router";
import type RoomsController from "./rooms.controller";

export const ROOMS_ROUTER_NAME = "rooms";

@injectable()
class RoomsRouter {
  constructor(
    @inject(CONTROLLER_TYPES.Rooms) private roomsController: RoomsController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) { }
  router() {
    const self = this;
    return this.trpcRouter.createRouter().mutation("validatePassword", {
      input: validatePasswordSchema,
      async resolve({ input }) {
        return self.roomsController.validatePassword(input);
      },
    });
  }

  protectedRouter() {
    const self = this;
    return this.trpcRouter
      .createProtectedRouter()
      .query("findMyRoom", {
        async resolve({ ctx }) {
          return self.roomsController.findMyRoom(ctx.user.id);
        },
      })
      .mutation("deleteMyRoom", {
        input: deleteMyRoomSchema,
        async resolve({ input, ctx }) {
          return self.roomsController.deleteMyRoom(input, ctx.user);
        },
      })
      .mutation("saveSettings", {
        input: saveSettingsSchema,
        async resolve({ input, ctx }) {
          return await self.roomsController.saveSettings(input, ctx.user);
        },
      })
      .query("getSettings", {
        input: getSettingsSchema,
        output: saveSettingsSchema,
        async resolve({ ctx, input }) {
          return await self.roomsController.getSettings(input, ctx.user);
        },
      });
  }

  routerWithUser() {
    const self = this;

    return this.trpcRouter
      .createRouterWithUser()
      .mutation("create", {
        input: createSchema,
        async resolve({ input, ctx }) {
          return await self.roomsController.create(input, ctx.user);
        },
      })
      .query("requestForRoomTransient", {
        input: requestForRoomTransientSchema,
        async resolve({ ctx, input }) {
          return await self.roomsController.requestForRoomTransient(
            input,
            ctx.user
          );
        },
      })
      .query("findByRoomIdentificationId", {
        input: findByRoomIdentificationIdSchema,
        async resolve({ input, ctx }) {
          return await self.roomsController.findByRoomIdentificationId(
            input,
            ctx.user
          );
        },
      })
      .query("getOnlineInfo", {
        input: getOnlineInfoSchema,
        async resolve({ input, ctx }) {
          return await self.roomsController.getOnlineInfo(input, ctx.user);
        },
      })
      .query("getRoomInitialMetadata", {
        input: getRoomInitialMetadataSchema,
        async resolve({ ctx, input }) {
          return await self.roomsController.getRoomInitialMetadata(input, ctx.user);
        },
      })
      .subscription('subscribeToRoomMetadata', {
        input: subscribeToRoomMetadataSchema,
        async resolve({ ctx, input }) {
          return await self.roomsController.subscribeToRoomMetadata(input, ctx.user)
        }
      })
      ;
  }
}

export default RoomsRouter;

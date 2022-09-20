import {
    createSchema,
    deleteMyRoomSchema,
    findByRoomIdentificationIdSchema,
    getOnlineInfoSchema,
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
        return this.trpcRouter.createRouter()
            .query("findByRoomIdentificationId", {
                input: findByRoomIdentificationIdSchema,
                async resolve({ input }) {
                    return await self.roomsController.findByRoomIdentificationId(input);
                },
            })
            .query("getOnlineInfo", {
                input: getOnlineInfoSchema,
                async resolve({ input }) {
                    return await self.roomsController.getOnlineInfo(
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
                    return self.roomsController.findMyRoom(ctx.user.id);
                },
            })
            .mutation("deleteMyRoom", {
                input: deleteMyRoomSchema,
                async resolve({ input, ctx }) {
                    return self.roomsController.deleteMyRoom(input, ctx.user);
                },
            });
    }

    routerWithUser() {
        const self = this;

        return this.trpcRouter.createRouterWithUser().mutation("create", {
            input: createSchema,
            async resolve({ input, ctx }) {
                return await self.roomsController.create(input, ctx.user);
            },
        });
    }
}

export default RoomsRouter;

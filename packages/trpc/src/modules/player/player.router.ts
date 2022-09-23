import zod from "zod";
import type { PlayerStatus } from "../../types/player";
import { inject, injectable } from "inversify";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import type TRPCRouter from "../../trpc/router";
import type PlayerController from "./player.controller";

export const PLAYER_ROUTER_NAME = "player";

@injectable()
class PlayerRouter {
  constructor(
    @inject(CONTROLLER_TYPES.Player) private playerController: PlayerController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) { }

  router() {
    const self = this;

    return this.trpcRouter
      .createRouter()
      .subscription("statusSubscription", {
        input: zod.object({
          id: zod.string(),
          name: zod.string(),
        }),
        async resolve({ input }) {
          return await self.playerController.statusSubscription(input);
        },
      })

      .mutation("control", {
        input: zod.object({
          id: zod.string(),
          statusObject: zod.object({
            type: zod.string(),
            time: zod.number().optional(),
            name: zod.string(),
            tabSessionId: zod.number(),
            url: zod.string(),
            thumbnail: zod.string().optional(),
            videoPlatform: zod.string().optional()
          }),
        }),
        async resolve({ input }) {
          return await self.playerController.control(
            input as { id: string; statusObject: PlayerStatus }
          );
        },
      });
  }
}

export default PlayerRouter;

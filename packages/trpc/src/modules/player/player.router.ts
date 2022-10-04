import type { PlayerStatus } from "../../types/player";
import { inject, injectable } from "inversify";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import type TRPCRouter from "../../trpc/router";
import type PlayerController from "./player.controller";
import { controlSchema, statusSubscriptionSchema } from "./player.schema";

export const PLAYER_ROUTER_NAME = "player";

@injectable()
class PlayerRouter {
  constructor(
    @inject(CONTROLLER_TYPES.Player) private playerController: PlayerController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) {}

  router() {
    const self = this;

    return this.trpcRouter
      .createRouter()
      .subscription("statusSubscription", {
        input: statusSubscriptionSchema,
        async resolve({ input }) {
          return await self.playerController.statusSubscription(input);
        },
      })

      .mutation("control", {
        input: controlSchema,
        async resolve({ input }) {
          return await self.playerController.control(input);
        },
      });
  }

  routerWithUser() {}
}

export default PlayerRouter;

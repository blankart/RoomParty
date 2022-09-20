import zod from "zod";
import PlayerService from "./player.service";
import { PlayerStatus } from "../../types/player";
import { inject, injectable } from "inversify";
import { SERVICES_TYPES, TRPC_ROUTER } from "../../types/container";
import TRPCRouter from "../../trpc/router";

export const PLAYER_ROUTER_NAME = "player";

@injectable()
class PlayerController {
  constructor(
    @inject(SERVICES_TYPES.Player) private playerService: PlayerService,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) { }

  router() {
    const self = this;

    return this.trpcRouter.createRouter()
      .subscription("statusSubscription", {
        input: zod.object({
          id: zod.string(),
          name: zod.string(),
        }),
        async resolve({ input }) {
          return await self.playerService.statusSubscription(input);
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
          }),
        }),
        async resolve({ input }) {
          return await self.playerService.control(
            input as { id: string; statusObject: PlayerStatus }
          );
        },
      });
  }
}

export default PlayerController;

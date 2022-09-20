import zod from "zod";
import YoutubeService from "./youtube.service";
import { inject, injectable } from 'inversify'
import { SERVICES_TYPES, TRPC_ROUTER } from "../../types/container";
import TRPCRouter from "../../trpc/router";

export const YOUTUBE_ROUTER_NAME = "youtube";

@injectable()
class YoutubeController {
  constructor(
    @inject(SERVICES_TYPES.Youtube) private youtubeService: YoutubeService,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) { }

  router() {
    const self = this
    return this.trpcRouter.createRouter().query("search", {
      input: zod.string(),
      async resolve({ input }) {
        return await self.youtubeService.search(input);
      },
    })
  }
}

export default YoutubeController

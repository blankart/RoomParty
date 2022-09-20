import zod from "zod";
import { inject, injectable } from 'inversify'
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import TRPCRouter from "../../trpc/router";
import YoutubeController from "./youtube.controller";

export const YOUTUBE_ROUTER_NAME = "youtube";

@injectable()
class YoutubeRouter {
    constructor(
        @inject(CONTROLLER_TYPES.Youtube) private youtubeController: YoutubeController,
        @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
    ) { }

    router() {
        const self = this
        return this.trpcRouter.createRouter().query("search", {
            input: zod.string(),
            async resolve({ input }) {
                return await self.youtubeController.search(input);
            },
        })
    }
}

export default YoutubeRouter

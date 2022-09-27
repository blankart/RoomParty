import { inject, injectable } from "inversify";
import TRPCRouter from "../../trpc/router";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import VideoChatController from "./video-chat.controller";
import {
  broadcastStateChangeSchema,
  videoChatSubscriptionSchema,
} from "./video-chat.schema";

export const VIDEO_CHAT_ROUTER_NAME = "video-chat";

@injectable()
class VideoChatRouter {
  constructor(
    @inject(CONTROLLER_TYPES.VideoChat)
    private videoChatController: VideoChatController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) {}

  routerWithUser() {
    const self = this;

    return this.trpcRouter
      .createRouterWithUser()
      .mutation("broadcastStateChange", {
        input: broadcastStateChangeSchema,
        async resolve({ input, ctx }) {
          return self.videoChatController.broadcastStateChange(input, ctx.user);
        },
      })
      .subscription("videoChatSubscription", {
        input: videoChatSubscriptionSchema,
        async resolve({ input, ctx }) {
          return await self.videoChatController.videoChatSubscription(
            input,
            ctx.user
          );
        },
      });
  }
}

export default VideoChatRouter;

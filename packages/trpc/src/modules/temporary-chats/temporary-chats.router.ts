import { TRPCError } from "@trpc/server";
import { injectable, inject } from "inversify";
import { RateLimiterMemory } from "rate-limiter-flexible";
import TRPCRouter from "../../trpc/router";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import TemporaryChatsController from "./temporary-chats.controller";
import { chatsSubscriptionSchema, sendSchema } from "./temporary-chats.schema";

export const TEMPORARY_CHATS_ROUTER_NAME = "temporary-chats";

const ALLOWED_CHAT_MESSAGES_IN_N_SECONDS = 10;
const CHAT_MESSAGES_LIMIT_DURATION_IN_SECONDS = 10;

const temporaryChatRateLimiter = new RateLimiterMemory({
  points: ALLOWED_CHAT_MESSAGES_IN_N_SECONDS,
  duration: CHAT_MESSAGES_LIMIT_DURATION_IN_SECONDS,
});

@injectable()
class TemporaryChatsRouter {
  constructor(
    @inject(CONTROLLER_TYPES.TemporaryChats)
    private temporaryChatsController: TemporaryChatsController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) {}

  router() {
    const self = this;
    return this.trpcRouter
      .createRouter()
      .middleware(async ({ ctx, next, rawInput }) => {
        const result = sendSchema.safeParse(rawInput);
        if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });
        try {
          await temporaryChatRateLimiter.consume(
            result.data.id + "-" + (result.data.userId ?? "")
          );
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Chat is temporarily disabled. Try again after ${CHAT_MESSAGES_LIMIT_DURATION_IN_SECONDS} seconds`,
          });
        }
        return next({ ctx });
      })
      .mutation("send", {
        input: sendSchema,
        async resolve({ input }) {
          return await self.temporaryChatsController.send(input);
        },
      });
  }

  routerWithUser() {
    const self = this;
    return this.trpcRouter
      .createRouterWithUser()
      .subscription("chatSubscription", {
        input: chatsSubscriptionSchema,
        async resolve({ ctx, input }) {
          return await self.temporaryChatsController.chatSubscription(
            input,
            ctx.user
          );
        },
      });
  }
}

export default TemporaryChatsRouter;

import { injectable, inject } from "inversify";
import { CONTROLLER_TYPES, TRPC_ROUTER } from "../../types/container";
import type TRPCRouter from "../../trpc/router";
import type ChatsController from "./chats.controller";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { TRPCError } from "@trpc/server";
import {
  chatsSchema,
  chatsSubscriptionSchema,
  sendSchema,
} from "./chats.schema";

export const CHATS_ROUTER_NAME = "chats";

const ALLOWED_CHAT_MESSAGES_IN_N_SECONDS = 10;
const CHAT_MESSAGES_LIMIT_DURATION_IN_SECONDS = 10;

const chatRateLimiter = new RateLimiterMemory({
  points: ALLOWED_CHAT_MESSAGES_IN_N_SECONDS,
  duration: CHAT_MESSAGES_LIMIT_DURATION_IN_SECONDS,
});

@injectable()
class ChatsRouter {
  constructor(
    @inject(CONTROLLER_TYPES.Chats) private chatsController: ChatsController,
    @inject(TRPC_ROUTER) private trpcRouter: TRPCRouter
  ) {}

  router() {
    const self = this;
    return this.trpcRouter
      .createRouter()
      .query("chats", {
        input: chatsSchema,
        async resolve({ input }) {
          return self.chatsController.chats(input);
        },
      })

      .merge(
        this.trpcRouter
          .createRouter()
          .middleware(async ({ ctx, next, rawInput }) => {
            const result = sendSchema.safeParse(rawInput);
            if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });
            try {
              await chatRateLimiter.consume(
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
              return await self.chatsController.send(input);
            },
          })
      );
  }

  routerWithUser() {
    const self = this;
    return this.trpcRouter
      .createRouterWithUser()
      .subscription("chatSubscription", {
        input: chatsSubscriptionSchema,
        async resolve({ input, ctx }) {
          return await self.chatsController.chatSubscription(input, ctx.user);
        },
      });
  }
}

export default ChatsRouter;

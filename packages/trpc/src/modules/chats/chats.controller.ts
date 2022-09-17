import { createRouter, createRouterWithUser } from "../../trpc";
import zod from "zod";
import ChatsService from "./chats.service";

export const CHATS_ROUTER_NAME = "chats";

export const chatsRouter = createRouter()
  .query("chats", {
    input: zod.string(),
    async resolve({ input }) {
      return ChatsService.findChatsByRoomId(input);
    },
  })

  .mutation("send", {
    input: zod.object({
      name: zod.string(),
      message: zod.string(),
      id: zod.string(),
      userId: zod.string().optional(),
      color: zod.string(),
    }),
    async resolve({ input }) {
      return await ChatsService.send(input);
    },
  });

export const chatsWithUserRouter = createRouterWithUser().subscription(
  "chatSubscription",
  {
    input: zod.object({
      id: zod.string(),
      name: zod.string(),
      localStorageSessionId: zod.number(),
    }),
    async resolve({ input, ctx }) {
      return await ChatsService.chatSubscription(input, ctx.user);
    },
  }
);

import zod from "zod";
import {
  chatsSchema,
  chatsSubscriptionSchema,
  sendSchema,
} from "./chats.schema";

export type ChatsSchema = zod.TypeOf<typeof chatsSchema>;

export type SendSchema = zod.TypeOf<typeof sendSchema>;

export type ChatSubscriptionSchema = zod.TypeOf<typeof chatsSubscriptionSchema>;

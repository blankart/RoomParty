import zod from "zod";
import { chatsSubscriptionSchema, sendSchema } from "./temporary-chats.schema";

export type SendSchema = zod.TypeOf<typeof sendSchema>;

export type ChatsSubscriptionSchema = zod.TypeOf<
  typeof chatsSubscriptionSchema
>;

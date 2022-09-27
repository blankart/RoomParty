import zod from "zod";
import {
  broadcastStateChangeSchema,
  videoChatSubscriptionSchema,
} from "./video-chat.schema";

export type BroadcastStateChangeSchema = zod.TypeOf<
  typeof broadcastStateChangeSchema
>;

export type VideoChatSubscriptionSchema = zod.TypeOf<
  typeof videoChatSubscriptionSchema
>;

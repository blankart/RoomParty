import zod from "zod";

export const broadcastStateChangeSchema = zod.object({
  roomIdentificationId: zod.string(),
  localStorageSessionId: zod.number(),
  password: zod.string().optional(),
  isMuted: zod.boolean(),
  isVideoDisabled: zod.boolean(),
});

export const videoChatSubscriptionSchema = zod.object({
  roomIdentificationId: zod.string(),
  localStorageSessionId: zod.number(),
  password: zod.string().optional(),
  isMuted: zod.boolean(),
  isVideoDisabled: zod.boolean(),
});

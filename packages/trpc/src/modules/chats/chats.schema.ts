import zod from "zod";

export const sendSchema = zod.object({
  name: zod.string(),
  message: zod.string(),
  id: zod.string(),
  userId: zod.string().optional(),
  color: zod.string(),
});

export const chatsSchema = zod.object({
  id: zod.string(),
});

export const chatsSubscriptionSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  localStorageSessionId: zod.number(),
  roomTransientId: zod.string(),
  password: zod.string().optional(),
});

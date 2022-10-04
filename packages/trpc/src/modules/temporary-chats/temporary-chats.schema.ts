import zod from "zod";

export const sendSchema = zod.object({
  roomTransientId: zod.string(),
  id: zod.string(),
  name: zod.string().min(3).max(15),
  message: zod.string().min(1).max(200),
  color: zod.string().startsWith("#").length(7),
  userId: zod.string().optional(),
});

export const chatsSubscriptionSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  localStorageSessionId: zod.number(),
  roomTransientId: zod.string(),
  password: zod.string().optional(),
});

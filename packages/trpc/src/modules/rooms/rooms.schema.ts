import zod from "zod";

const roomIdentificationId = zod
  .string()
  .length(8, "Room ID must have exactly 8 characters.");

export const findByRoomIdentificationIdSchema = zod.object({
  roomIdentificationId,
});

export const getOnlineInfoSchema = zod.object({
  roomIdentificationId,
});

export const deleteMyRoomSchema = zod.object({
  id: zod.string(),
});

export const createSchema = zod.object({
  name: zod
    .string()
    .min(5, "Room name must have a minimum of 5 characters")
    .max(20, "Room name must have at most 20 characters"),
});

export const requestForRoomTransientSchema = zod.object({
  roomIdentificationId,
  localStorageSessionId: zod.number(),
  userName: zod.string()
});

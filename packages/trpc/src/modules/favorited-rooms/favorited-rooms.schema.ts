import zod from "zod";

export const toggleSchema = zod.object({
  roomId: zod.string(),
});

export const isRoomFavoritedSchema = zod.object({
  roomId: zod.string(),
});

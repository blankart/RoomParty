import zod from "zod";
import { isRoomFavoritedSchema, toggleSchema } from "./favorited-rooms.schema";

export type ToggleSchema = zod.TypeOf<typeof toggleSchema>;

export type IsRoomFavoritedSchema = zod.TypeOf<typeof isRoomFavoritedSchema>;

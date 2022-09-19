import zod from "zod";
import {
  createSchema,
  deleteMyRoomSchema,
  findByRoomIdentificationIdSchema,
} from "./rooms.schema";

export type FindByRoomIdentificationIdSchema = zod.TypeOf<
  typeof findByRoomIdentificationIdSchema
>;

export type DeleteMyRoomSchema = zod.TypeOf<typeof deleteMyRoomSchema>;

export type CreateSchema = zod.TypeOf<typeof createSchema>;

import zod from "zod";
import {
  createSchema,
  deleteMyRoomSchema,
  findByIdSchema,
  findByRoomIdentificationIdSchema,
} from "./rooms.schema";

export type FindByIdSchema = zod.TypeOf<typeof findByIdSchema>;

export type FindByRoomIdentificationIdSchema = zod.TypeOf<
  typeof findByRoomIdentificationIdSchema
>;

export type DeleteMyRoomSchema = zod.TypeOf<typeof deleteMyRoomSchema>;

export type CreateSchema = zod.TypeOf<typeof createSchema>;

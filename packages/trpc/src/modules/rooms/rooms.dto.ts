import zod from "zod";
import {
  createSchema,
  deleteMyRoomSchema,
  getOnlineInfoSchema,
  findByRoomIdentificationIdSchema,
  requestForRoomTransientSchema,
} from "./rooms.schema";

export type FindByRoomIdentificationIdSchema = zod.TypeOf<
  typeof findByRoomIdentificationIdSchema
>;

export type GetOnlineInfoSchema = zod.TypeOf<typeof getOnlineInfoSchema>;

export type DeleteMyRoomSchema = zod.TypeOf<typeof deleteMyRoomSchema>;

export type CreateSchema = zod.TypeOf<typeof createSchema>;

export type RequestForTransientSchema = zod.TypeOf<
  typeof requestForRoomTransientSchema
>;

import zod from "zod";
import {
  createSchema,
  deleteMyRoomSchema,
  getOnlineInfoSchema,
  findByRoomIdentificationIdSchema,
  requestForRoomTransientSchema,
  saveSettingsSchema,
  getSettingsSchema,
  getRoomPermissionsSchema,
  validatePasswordSchema,
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

export type SaveSettingsSchema = zod.TypeOf<typeof saveSettingsSchema>

export type GetSettingsSchema = zod.TypeOf<typeof getSettingsSchema>

export type GetRoomPermissionsSchema = zod.TypeOf<typeof getRoomPermissionsSchema>

export type ValidatePasswordSchema = zod.TypeOf<typeof validatePasswordSchema>
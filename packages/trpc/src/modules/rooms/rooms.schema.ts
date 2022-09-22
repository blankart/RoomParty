import zod from "zod";

const roomIdentificationId = zod
  .string()
  .length(8, "Room ID must have exactly 8 characters.");

export const findByRoomIdentificationIdSchema = zod.object({
  roomIdentificationId,
  password: zod.string().optional()
});

export const getOnlineInfoSchema = zod.object({
  roomIdentificationId,
  password: zod.string().optional()
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
  userName: zod.string().optional(),
  password: zod.string().optional()
});

export const saveSettingsSchema = zod.object({
  id: zod.string(),
  private: zod.boolean(),
  password: zod.string().min(8, 'Password must have a minimum of 5 characters').optional().nullable()
}).refine(schema => schema.private ? !!schema.password : true, {
  message: 'Password is required.',
  path: ['password']
})

export const getSettingsSchema = zod.object({
  id: zod.string()
})

export const getRoomPermissionsSchema = zod.object({
  roomIdentificationId
})

export const validatePasswordSchema = zod.object({
  password: zod.string(),
  roomIdentificationId
})
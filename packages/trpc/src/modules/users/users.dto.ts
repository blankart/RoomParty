import { confirmVerificationCodeSchema, registerSchema } from "./users.schema";
import zod from 'zod'

export type RegisterSchema = zod.TypeOf<typeof registerSchema>

export type ConfirmVerificationCodeSchema = zod.TypeOf<typeof confirmVerificationCodeSchema>
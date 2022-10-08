import {
  confirmVerificationCodeSchema,
  getVerificationDetailsSchema,
  signInSchema,
  registerSchema,
  resendVerificationCodeSchema,
} from "./users.schema";
import zod from "zod";

export type RegisterSchema = zod.TypeOf<typeof registerSchema>;

export type ConfirmVerificationCodeSchema = zod.TypeOf<
  typeof confirmVerificationCodeSchema
>;

export type ResendVerificationCodeSchema = zod.TypeOf<
  typeof resendVerificationCodeSchema
>;

export type GetVerificationDetailsSchema = zod.TypeOf<
  typeof getVerificationDetailsSchema
>;

export type SignInSchema = zod.TypeOf<typeof signInSchema>;

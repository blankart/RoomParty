import zod from "zod";
import { controlSchema, statusSubscriptionSchema } from "./player.schema";

export type StatusSubscriptionSchema = zod.TypeOf<
  typeof statusSubscriptionSchema
>;

export type ControlSchema = zod.TypeOf<typeof controlSchema>;

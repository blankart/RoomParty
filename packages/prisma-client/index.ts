import { PrismaClient } from "@prisma/client";
export type {
  Chat,
  Account,
  User,
  Prisma,
  VideoControlRights,
  VideoPlatform,
  Room,
} from "@prisma/client";

export const createPrismaClient = () => new PrismaClient();

export type CustomPrismaClient = ReturnType<typeof createPrismaClient>;

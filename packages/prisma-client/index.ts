import { PrismaClient } from "@prisma/client";

export type { Chat, Account, User } from "@prisma/client";

export const createPrismaClient = () => new PrismaClient();

export type CustomPrismaClient = ReturnType<typeof createPrismaClient>;

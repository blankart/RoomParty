import { PrismaClient } from '@prisma/client'

export { Chat } from '@prisma/client'

export const createPrismaClient = () => new PrismaClient()

export type CustomPrismaClient = ReturnType<typeof createPrismaClient>
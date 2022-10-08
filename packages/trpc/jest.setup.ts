import "reflect-metadata";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { jest } from "@jest/globals";
import { createPrismaClient } from "@RoomParty/prisma-client";

jest.mock("@RoomParty/prisma-client", () => ({
  __esModule: true,
  createPrismaClient: () => mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock =
  createPrismaClient() as unknown as DeepMockProxy<PrismaClient>;

import type { Account, User } from "@RoomParty/prisma-client";

export type CurrentUser = (Account & { user: User }) | null | undefined;

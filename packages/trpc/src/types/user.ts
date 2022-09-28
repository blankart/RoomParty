import type { Account, User } from "@partyfy/prisma-client";

export type CurrentUser = (Account & { user: User }) | null | undefined;

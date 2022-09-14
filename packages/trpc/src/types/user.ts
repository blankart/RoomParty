import type { Account, User } from "@rooms2watch/prisma-client";

export type CurrentUser = (Account & { user: User }) | null | undefined;

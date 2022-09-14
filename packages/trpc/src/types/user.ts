import { Account, User } from "prisma-client";

export type CurrentUser = (Account & { user: User }) | null;

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_accountId_fkey";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "accountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

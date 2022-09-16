/*
  Warnings:

  - You are about to drop the column `videoHost` on the `Room` table. All the data in the column will be lost.
  - Made the column `accountId` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('Youtube');

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_accountId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "videoHost",
ADD COLUMN     "videoPlatform" "VideoPlatform" NOT NULL DEFAULT 'Youtube',
ALTER COLUMN "accountId" SET NOT NULL;

-- DropEnum
DROP TYPE "VideoHost";

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

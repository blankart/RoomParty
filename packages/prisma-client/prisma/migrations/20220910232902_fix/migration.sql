/*
  Warnings:

  - You are about to drop the column `playerTime` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "playerTime",
ADD COLUMN     "playerStatus" JSONB;

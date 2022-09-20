/*
  Warnings:

  - You are about to drop the column `onlineGuests` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "onlineGuests";

-- CreateTable
CREATE TABLE "RoomTransient" (
    "id" TEXT NOT NULL,
    "localStorageSessionid" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "RoomTransient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomTransient" ADD CONSTRAINT "RoomTransient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomTransient" ADD CONSTRAINT "RoomTransient_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

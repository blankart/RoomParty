-- DropForeignKey
ALTER TABLE "RoomTransient" DROP CONSTRAINT "RoomTransient_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomTransient" DROP CONSTRAINT "RoomTransient_userId_fkey";

-- AddForeignKey
ALTER TABLE "RoomTransient" ADD CONSTRAINT "RoomTransient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomTransient" ADD CONSTRAINT "RoomTransient_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

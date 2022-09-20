-- DropForeignKey
ALTER TABLE "RoomTransient" DROP CONSTRAINT "RoomTransient_userId_fkey";

-- AlterTable
ALTER TABLE "RoomTransient" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RoomTransient" ADD CONSTRAINT "RoomTransient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "online" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnailUrl" TEXT;

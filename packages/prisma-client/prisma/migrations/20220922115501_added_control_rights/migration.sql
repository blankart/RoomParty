-- CreateEnum
CREATE TYPE "VideoControlRights" AS ENUM ('OwnerOnly', 'Everyone');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "videoControlRights" "VideoControlRights" NOT NULL DEFAULT 'Everyone';

-- CreateEnum
CREATE TYPE "VideoHost" AS ENUM ('Youtube');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "description" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoHost" "VideoHost" NOT NULL DEFAULT 'Youtube';

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

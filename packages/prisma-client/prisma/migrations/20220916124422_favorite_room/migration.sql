-- CreateTable
CREATE TABLE "FavoritedRoom" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FavoritedRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FavoritedRoom" ADD CONSTRAINT "FavoritedRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritedRoom" ADD CONSTRAINT "FavoritedRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

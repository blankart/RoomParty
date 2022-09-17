/*
  Warnings:

  - Added the required column `roomIdentificationId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "roomIdentificationId" TEXT NOT NULL;

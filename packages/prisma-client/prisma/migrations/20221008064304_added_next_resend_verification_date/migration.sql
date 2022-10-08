/*
  Warnings:

  - Added the required column `nextResendVerificationDate` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "nextResendVerificationDate" TIMESTAMP(3) NOT NULL;

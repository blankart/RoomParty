/*
  Warnings:

  - The `provider` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('Google', 'Local');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "provider",
ADD COLUMN     "provider" "Providers" NOT NULL DEFAULT 'Local';

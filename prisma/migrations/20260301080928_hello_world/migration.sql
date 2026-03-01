/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Concern" ADD COLUMN     "isSpam" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "isSpam" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ADD COLUMN     "dailyPostCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPostReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

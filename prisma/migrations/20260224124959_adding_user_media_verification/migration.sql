/*
  Warnings:

  - You are about to drop the column `mediaId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'rejected', 'approved');

-- CreateEnum
CREATE TYPE "MediaFor" AS ENUM ('concern', 'announcement', 'userverification');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_mediaId_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "for" "MediaFor",
ADD COLUMN     "ownerId" INTEGER,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" INTEGER,
ADD COLUMN     "verificationStatus" "VerificationStatus" DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mediaId";

-- CreateIndex
CREATE UNIQUE INDEX "Media_ownerId_key" ON "Media"("ownerId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

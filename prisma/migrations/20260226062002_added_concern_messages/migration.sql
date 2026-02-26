/*
  Warnings:

  - You are about to drop the `Mediation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Summons` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_summonId_fkey";

-- DropForeignKey
ALTER TABLE "Mediation" DROP CONSTRAINT "Mediation_concernId_fkey";

-- DropForeignKey
ALTER TABLE "Mediation" DROP CONSTRAINT "Mediation_officialId_fkey";

-- DropForeignKey
ALTER TABLE "Mediation" DROP CONSTRAINT "Mediation_residentId_fkey";

-- DropForeignKey
ALTER TABLE "Summons" DROP CONSTRAINT "Summons_concernId_fkey";

-- DropForeignKey
ALTER TABLE "Summons" DROP CONSTRAINT "Summons_officialId_fkey";

-- DropForeignKey
ALTER TABLE "Summons" DROP CONSTRAINT "Summons_residentId_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "concernMessagesId" INTEGER;

-- DropTable
DROP TABLE "Mediation";

-- DropTable
DROP TABLE "Summons";

-- CreateTable
CREATE TABLE "ConcernMessage" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "concernId" INTEGER NOT NULL,

    CONSTRAINT "ConcernMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConcernMessage" ADD CONSTRAINT "ConcernMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernMessage" ADD CONSTRAINT "ConcernMessage_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_concernMessagesId_fkey" FOREIGN KEY ("concernMessagesId") REFERENCES "ConcernMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - The `validation` column on the `Concern` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `remarks` column on the `Summons` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Validation" AS ENUM ('pending', 'approved', 'rejected');

-- AlterEnum
ALTER TYPE "ConcernStatus" ADD VALUE 'summoned';

-- AlterTable
ALTER TABLE "Concern" ADD COLUMN     "needsBarangayAssistance" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "validation",
ADD COLUMN     "validation" "Validation" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "summonId" INTEGER;

-- AlterTable
ALTER TABLE "Summons" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "summonDate" TIMESTAMP(3),
DROP COLUMN "remarks",
ADD COLUMN     "remarks" "ConcernStatus";

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_summonId_fkey" FOREIGN KEY ("summonId") REFERENCES "Summons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

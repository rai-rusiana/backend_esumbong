-- AlterEnum
ALTER TYPE "ConcernStatus" ADD VALUE 'verified';

-- AlterTable
ALTER TABLE "Concern" ADD COLUMN     "assinedToId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "barangay" TEXT;

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_assinedToId_fkey" FOREIGN KEY ("assinedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

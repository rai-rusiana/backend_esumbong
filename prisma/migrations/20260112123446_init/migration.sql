-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConcernStatus" ADD VALUE 'canceled';
ALTER TYPE "ConcernStatus" ADD VALUE 'approved';
ALTER TYPE "ConcernStatus" ADD VALUE 'rejected';

-- AlterTable
ALTER TABLE "Concern" ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedById" INTEGER,
ADD COLUMN     "validation" "ConcernStatus" NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

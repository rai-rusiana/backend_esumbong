-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "concernUpdateId" INTEGER;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_concernUpdateId_fkey" FOREIGN KEY ("concernUpdateId") REFERENCES "ConcernUpdate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

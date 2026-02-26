-- AlterTable
ALTER TABLE "Concern" ADD COLUMN     "ArchivedById" INTEGER,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_ArchivedById_fkey" FOREIGN KEY ("ArchivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "isAI" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mediaId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

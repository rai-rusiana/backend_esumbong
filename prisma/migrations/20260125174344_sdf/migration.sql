/*
  Warnings:

  - The primary key for the `Media` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'file';

-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey",
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Media_id_seq";

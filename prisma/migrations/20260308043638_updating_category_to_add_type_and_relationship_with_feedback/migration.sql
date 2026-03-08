-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('concern', 'feedback');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" "CategoryType" NOT NULL DEFAULT 'concern';

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "other" TEXT,
ADD COLUMN     "star" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

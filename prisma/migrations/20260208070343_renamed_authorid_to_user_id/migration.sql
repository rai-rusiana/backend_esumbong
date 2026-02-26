/*
  Warnings:

  - You are about to drop the column `authorId` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_authorId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "authorId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

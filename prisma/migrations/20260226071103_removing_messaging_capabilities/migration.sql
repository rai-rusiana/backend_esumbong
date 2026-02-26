/*
  Warnings:

  - You are about to drop the `ConcernMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConcernMessage" DROP CONSTRAINT "ConcernMessage_concernId_fkey";

-- DropForeignKey
ALTER TABLE "ConcernMessage" DROP CONSTRAINT "ConcernMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_concernMessagesId_fkey";

-- DropTable
DROP TABLE "ConcernMessage";

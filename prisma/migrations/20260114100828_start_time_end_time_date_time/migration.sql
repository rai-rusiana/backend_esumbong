/*
  Warnings:

  - The `endTime` column on the `Summons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startTime` column on the `Summons` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Summons" DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3),
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3);

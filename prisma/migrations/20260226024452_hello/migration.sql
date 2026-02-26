/*
  Warnings:

  - The values [summoned] on the enum `ConcernStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConcernStatus_new" AS ENUM ('pending', 'inProgress', 'verified', 'canceled', 'approved', 'rejected', 'resolved');
ALTER TABLE "public"."Concern" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Concern" ALTER COLUMN "status" TYPE "ConcernStatus_new" USING ("status"::text::"ConcernStatus_new");
ALTER TABLE "ConcernUpdate" ALTER COLUMN "status" TYPE "ConcernStatus_new" USING ("status"::text::"ConcernStatus_new");
ALTER TABLE "Summons" ALTER COLUMN "remarks" TYPE "ConcernStatus_new" USING ("remarks"::text::"ConcernStatus_new");
ALTER TYPE "ConcernStatus" RENAME TO "ConcernStatus_old";
ALTER TYPE "ConcernStatus_new" RENAME TO "ConcernStatus";
DROP TYPE "public"."ConcernStatus_old";
ALTER TABLE "Concern" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

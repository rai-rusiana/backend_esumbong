-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'userVerification';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "url" DROP NOT NULL;

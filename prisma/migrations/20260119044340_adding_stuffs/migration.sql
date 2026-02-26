-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "notifyOfficials" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyResidents" BOOLEAN NOT NULL DEFAULT true;

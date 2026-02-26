-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('admin', 'resident', 'barangay_official');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('concern', 'feedback', 'summons', 'mediation', 'update', 'alert');

-- CreateEnum
CREATE TYPE "ConcernStatus" AS ENUM ('pending', 'inProgress', 'resolved');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('photo', 'video');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "position" TEXT,
    "contactNumber" TEXT NOT NULL,
    "type" "UserType" NOT NULL DEFAULT 'admin',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concern" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "details" TEXT NOT NULL,
    "location" TEXT,
    "categoryId" INTEGER,
    "other" TEXT,
    "status" "ConcernStatus" NOT NULL DEFAULT 'pending',
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConcernUpdate" (
    "id" SERIAL NOT NULL,
    "updateMessage" TEXT NOT NULL,
    "status" "ConcernStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concernId" INTEGER NOT NULL,

    CONSTRAINT "ConcernUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "concernId" INTEGER,
    "feedbackId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "feedbackUpdateId" INTEGER,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackUpdate" (
    "id" SERIAL NOT NULL,
    "feedbackMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summons" (
    "id" SERIAL NOT NULL,
    "remarks" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "officialId" INTEGER NOT NULL,
    "concernId" INTEGER NOT NULL,
    "residentId" INTEGER NOT NULL,

    CONSTRAINT "Summons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mediation" (
    "id" SERIAL NOT NULL,
    "residentId" INTEGER NOT NULL,
    "officialId" INTEGER NOT NULL,
    "concernId" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "schedule" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Mediation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT,
    "url" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemFeedback" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SystemFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concern" ADD CONSTRAINT "Concern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcernUpdate" ADD CONSTRAINT "ConcernUpdate_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_feedbackUpdateId_fkey" FOREIGN KEY ("feedbackUpdateId") REFERENCES "FeedbackUpdate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summons" ADD CONSTRAINT "Summons_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summons" ADD CONSTRAINT "Summons_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summons" ADD CONSTRAINT "Summons_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mediation" ADD CONSTRAINT "Mediation_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mediation" ADD CONSTRAINT "Mediation_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mediation" ADD CONSTRAINT "Mediation_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemFeedback" ADD CONSTRAINT "SystemFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

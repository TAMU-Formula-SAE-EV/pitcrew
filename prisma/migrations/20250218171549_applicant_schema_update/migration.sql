-- CreateEnum
CREATE TYPE "Status" AS ENUM ('REGISTRATION', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WAITLISTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'LEAD', 'MEMBER');

-- CreateEnum
CREATE TYPE "Subteams" AS ENUM ('SOFTWARE', 'DISTRIBUTED_BATTERY_MANAGEMENT', 'CHASSIS', 'ELECTRONICS', 'OPERATIONS', 'SPONSOR_RELATIONS', 'MARKETING', 'BUSINESS', 'POWERTRAIN', 'BATTERY', 'AERODYNAMICS', 'SUSPENSION', 'FINANCE');

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "major" TEXT,
    "year" INTEGER,
    "semester" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'REGISTRATION',
    "override" BOOLEAN NOT NULL DEFAULT false,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generalResponses" JSONB NOT NULL,
    "resumeUrl" TEXT,
    "applicantId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubteamApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responses" JSONB NOT NULL,
    "fileUrls" TEXT[],
    "applicationId" TEXT NOT NULL,
    "subteamId" TEXT NOT NULL,

    CONSTRAINT "SubteamApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subteam" (
    "id" TEXT NOT NULL,
    "name" "Subteams" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Subteam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantSubteam" (
    "applicantId" TEXT NOT NULL,
    "subteamId" TEXT NOT NULL,
    "preferenceOrder" INTEGER NOT NULL,

    CONSTRAINT "ApplicantSubteam_pkey" PRIMARY KEY ("applicantId","subteamId")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applicantId" TEXT NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewAdmin" (
    "interviewId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "InterviewAdmin_pkey" PRIMARY KEY ("interviewId","adminId")
);

-- CreateTable
CREATE TABLE "_AdminToSubteam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdminToSubteam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subteam_name_key" ON "Subteam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "_AdminToSubteam_B_index" ON "_AdminToSubteam"("B");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubteamApplication" ADD CONSTRAINT "SubteamApplication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubteamApplication" ADD CONSTRAINT "SubteamApplication_subteamId_fkey" FOREIGN KEY ("subteamId") REFERENCES "Subteam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSubteam" ADD CONSTRAINT "ApplicantSubteam_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSubteam" ADD CONSTRAINT "ApplicantSubteam_subteamId_fkey" FOREIGN KEY ("subteamId") REFERENCES "Subteam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAdmin" ADD CONSTRAINT "InterviewAdmin_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAdmin" ADD CONSTRAINT "InterviewAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToSubteam" ADD CONSTRAINT "_AdminToSubteam_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToSubteam" ADD CONSTRAINT "_AdminToSubteam_B_fkey" FOREIGN KEY ("B") REFERENCES "Subteam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

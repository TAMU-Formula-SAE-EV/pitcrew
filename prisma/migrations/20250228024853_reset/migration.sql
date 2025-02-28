/*
  Warnings:

  - You are about to drop the column `semester` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Applicant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "semester",
DROP COLUMN "year",
ADD COLUMN     "classification" TEXT,
ADD COLUMN     "gradSem" TEXT,
ADD COLUMN     "gradYear" INTEGER;

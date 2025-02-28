/*
  Warnings:

  - You are about to drop the column `classification` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `gradSem` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `gradYear` on the `Applicant` table. All the data in the column will be lost.
  - Changed the type of `generalResponses` on the `Application` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "classification",
DROP COLUMN "gradSem",
DROP COLUMN "gradYear",
ADD COLUMN     "semester" INTEGER,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "generalResponses",
ADD COLUMN     "generalResponses" JSONB NOT NULL;

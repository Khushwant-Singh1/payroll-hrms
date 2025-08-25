/*
  Warnings:

  - You are about to drop the column `allowances` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `allowances` on the `employee_drafts` table. All the data in the column will be lost.
  - Added the required column `bonus` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conveyanceAllowance` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dearnessAllowance` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employerEsicContribution` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employerPfContribution` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `esicDeduction` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foodAllowance` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incomeTaxDeduction` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceDeduction` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaveWithWages` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officeWearAllowance` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherAllowances` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherRecoveries` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overtimeRate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pfDeduction` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rateOfWages` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyDeduction` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialBasic` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Employee" DROP COLUMN "allowances",
ADD COLUMN     "bonus" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "conveyanceAllowance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "dearnessAllowance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "employerEsicContribution" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "employerPfContribution" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "esicDeduction" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "foodAllowance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "incomeTaxDeduction" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "insuranceDeduction" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "lastTransactionId" TEXT,
ADD COLUMN     "leaveWithWages" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "officeWearAllowance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "otherAllowances" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "otherRecoveries" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "overtimeRate" DECIMAL(8,2) NOT NULL,
ADD COLUMN     "pfDeduction" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "rateOfWages" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "societyDeduction" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "specialBasic" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."employee_drafts" DROP COLUMN "allowances",
ADD COLUMN     "bonus" DECIMAL(12,2),
ADD COLUMN     "conveyanceAllowance" DECIMAL(12,2),
ADD COLUMN     "dearnessAllowance" DECIMAL(12,2),
ADD COLUMN     "employerEsicContribution" DECIMAL(12,2),
ADD COLUMN     "employerPfContribution" DECIMAL(12,2),
ADD COLUMN     "esicDeduction" DECIMAL(12,2),
ADD COLUMN     "foodAllowance" DECIMAL(12,2),
ADD COLUMN     "incomeTaxDeduction" DECIMAL(12,2),
ADD COLUMN     "insuranceDeduction" DECIMAL(12,2),
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "lastTransactionId" TEXT,
ADD COLUMN     "leaveWithWages" DECIMAL(12,2),
ADD COLUMN     "officeWearAllowance" DECIMAL(12,2),
ADD COLUMN     "otherAllowances" DECIMAL(12,2),
ADD COLUMN     "otherRecoveries" DECIMAL(12,2),
ADD COLUMN     "overtimeRate" DECIMAL(8,2),
ADD COLUMN     "pfDeduction" DECIMAL(12,2),
ADD COLUMN     "rateOfWages" DECIMAL(12,2),
ADD COLUMN     "societyDeduction" DECIMAL(12,2),
ADD COLUMN     "specialBasic" DECIMAL(12,2);

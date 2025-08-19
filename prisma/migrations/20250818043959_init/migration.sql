-- CreateEnum
CREATE TYPE "public"."EmployeeStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "grade" TEXT,
    "status" "public"."EmployeeStatus" NOT NULL DEFAULT 'active',
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "basicSalary" DECIMAL(12,2) NOT NULL,
    "hra" DECIMAL(12,2) NOT NULL,
    "allowances" DECIMAL(12,2) NOT NULL,
    "pan" TEXT,
    "aadhaar" TEXT,
    "uan" TEXT,
    "esicNumber" TEXT,
    "pfOptIn" BOOLEAN NOT NULL DEFAULT true,
    "esiApplicable" BOOLEAN NOT NULL DEFAULT true,
    "lwfState" TEXT,
    "bankAccount" TEXT,
    "ifsc" TEXT,
    "branch" TEXT,
    "profilePic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "public"."Employee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "public"."Employee"("email");

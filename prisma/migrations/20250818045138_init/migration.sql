-- CreateTable
CREATE TABLE "public"."StatutoryReturn" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatutoryReturn_pkey" PRIMARY KEY ("id")
);

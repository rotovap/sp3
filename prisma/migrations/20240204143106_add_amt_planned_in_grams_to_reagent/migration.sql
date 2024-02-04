-- CreateEnum
CREATE TYPE "AmtPlannedUnit" AS ENUM ('G', 'MG', 'ML', 'L');

-- AlterTable
ALTER TABLE "ExperimentReagent" ADD COLUMN     "amountPlannedInGrams" DOUBLE PRECISION;

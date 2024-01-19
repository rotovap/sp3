/*
  Warnings:

  - Added the required column `limitingReagent` to the `ExperimentReagent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExperimentReagent" ADD COLUMN     "limitingReagent" BOOLEAN NOT NULL;

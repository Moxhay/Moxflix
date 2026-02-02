/*
  Warnings:

  - Added the required column `type` to the `Genre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "type" TEXT NOT NULL;

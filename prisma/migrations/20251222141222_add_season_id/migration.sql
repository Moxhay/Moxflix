/*
  Warnings:

  - Added the required column `episodeNumber` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `season_id` to the `Season` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "episodeNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "season_id" INTEGER NOT NULL;

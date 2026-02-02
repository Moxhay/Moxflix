/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Series` table. All the data in the column will be lost.
  - Added the required column `posterUrl` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posterUrl` to the `Series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "imageUrl",
ADD COLUMN     "posterUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Series" DROP COLUMN "imageUrl",
ADD COLUMN     "posterUrl" TEXT NOT NULL;

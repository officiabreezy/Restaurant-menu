/*
  Warnings:

  - You are about to drop the column `imagePublic` on the `Menu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "imagePublic",
ADD COLUMN     "imagePublicId" TEXT;

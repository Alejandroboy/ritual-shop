/*
  Warnings:

  - You are about to drop the column `priceMinor` on the `TemplateSizeFinishPrice` table. All the data in the column will be lost.
  - Added the required column `price` to the `TemplateSizeFinishPrice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TemplateSizeFinishPrice" DROP COLUMN "priceMinor",
ADD COLUMN     "price" INTEGER NOT NULL;

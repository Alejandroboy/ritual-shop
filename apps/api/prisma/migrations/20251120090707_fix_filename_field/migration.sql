/*
  Warnings:

  - You are about to drop the column `filename` on the `OrderItemAsset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItemAsset" DROP COLUMN "filename",
ADD COLUMN     "fileName" TEXT;

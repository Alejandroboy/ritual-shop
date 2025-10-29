/*
  Warnings:

  - You are about to drop the column `retouchNeeded` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "retouchNeeded";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "approveNeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retouchNeeded" BOOLEAN NOT NULL DEFAULT false;

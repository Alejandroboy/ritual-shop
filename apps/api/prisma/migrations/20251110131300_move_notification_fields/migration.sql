/*
  Warnings:

  - You are about to drop the column `notifyChannel` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `telegramChatId` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "notifyChannel",
DROP COLUMN "telegramChatId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyChannel" "NotifyChannel",
ADD COLUMN     "telegramChatId" TEXT;

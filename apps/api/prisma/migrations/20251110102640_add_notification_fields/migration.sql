-- CreateEnum
CREATE TYPE "NotifyChannel" AS ENUM ('TELEGRAM', 'WHATSAPP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notifyChannel" "NotifyChannel",
ADD COLUMN     "telegramChatId" TEXT;

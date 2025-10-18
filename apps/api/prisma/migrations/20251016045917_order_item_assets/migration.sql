/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('local', 's3');

-- DropForeignKey
ALTER TABLE "public"."Asset" DROP CONSTRAINT "Asset_itemId_fkey";

-- DropTable
DROP TABLE "public"."Asset";

-- CreateTable
CREATE TABLE "OrderItemAsset" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "storage" "StorageType" NOT NULL DEFAULT 's3',
    "path" TEXT,
    "bucket" TEXT,
    "key" TEXT,
    "contentType" TEXT,
    "size" INTEGER,
    "etag" TEXT,
    "originalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItemAsset_orderItemId_createdAt_idx" ON "OrderItemAsset"("orderItemId", "createdAt");

-- AddForeignKey
ALTER TABLE "OrderItemAsset" ADD CONSTRAINT "OrderItemAsset_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

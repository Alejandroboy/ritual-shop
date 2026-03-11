-- CreateEnum
CREATE TYPE "PendingUploadStatus" AS ENUM ('PENDING', 'ATTACHED', 'DELETED', 'FAILED');

-- CreateTable
CREATE TABLE "PendingUpload" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT,
    "userId" TEXT,
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "originalName" TEXT,
    "contentType" TEXT,
    "size" INTEGER,
    "etag" TEXT,
    "status" "PendingUploadStatus" NOT NULL DEFAULT 'PENDING',
    "mode" "AssetStage" NOT NULL DEFAULT 'ORIGINAL',
    "retouchOf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attachedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "lastError" TEXT,

    CONSTRAINT "PendingUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingUpload_key_key" ON "PendingUpload"("key");

-- CreateIndex
CREATE INDEX "PendingUpload_orderId_status_idx" ON "PendingUpload"("orderId", "status");

-- CreateIndex
CREATE INDEX "PendingUpload_expiresAt_status_idx" ON "PendingUpload"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "PendingUpload_itemId_idx" ON "PendingUpload"("itemId");

-- AddForeignKey
ALTER TABLE "PendingUpload" ADD CONSTRAINT "PendingUpload_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

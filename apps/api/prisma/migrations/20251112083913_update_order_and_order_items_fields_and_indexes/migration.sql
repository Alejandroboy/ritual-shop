-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "dateOfDeath" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "middleName" TEXT;

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_orderStatus_createdAt_idx" ON "Order"("orderStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");

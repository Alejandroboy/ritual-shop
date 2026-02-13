-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "includedInInvoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "invoiceName" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kontragentId" TEXT;

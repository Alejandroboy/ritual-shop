-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('DRAFT', 'ACCEPTED', 'IN_PROGRESS', 'APPROVAL', 'SENT', 'READY');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderStatus" "public"."OrderStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateEnum
CREATE TYPE "ApprovalStage" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'APPROVED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "approvalStage" "ApprovalStage" NOT NULL DEFAULT 'NOT_STARTED';

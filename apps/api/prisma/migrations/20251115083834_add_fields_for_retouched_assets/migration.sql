-- CreateEnum
CREATE TYPE "AssetStage" AS ENUM ('ORIGINAL', 'RETOUCHED');

-- AlterTable
ALTER TABLE "OrderItemAsset" ADD COLUMN     "derivedFromId" TEXT,
ADD COLUMN     "stage" "AssetStage" NOT NULL DEFAULT 'ORIGINAL';

-- AddForeignKey
ALTER TABLE "OrderItemAsset" ADD CONSTRAINT "OrderItemAsset_derivedFromId_fkey" FOREIGN KEY ("derivedFromId") REFERENCES "OrderItemAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

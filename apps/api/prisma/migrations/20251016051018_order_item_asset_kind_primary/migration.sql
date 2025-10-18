-- AlterTable
ALTER TABLE "OrderItemAsset" ADD COLUMN     "kind" "AssetKind" NOT NULL DEFAULT 'PHOTO',
ADD COLUMN     "primary" BOOLEAN NOT NULL DEFAULT false;

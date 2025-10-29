/*
  Warnings:

  - You are about to drop the column `totalMinor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `unitPriceMinor` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `basePriceMinor` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `extraPriceMinor` on the `TemplateBackground` table. All the data in the column will be lost.
  - You are about to drop the column `extraPriceMinor` on the `TemplateFinish` table. All the data in the column will be lost.
  - You are about to drop the column `extraPriceMinor` on the `TemplateFrame` table. All the data in the column will be lost.
  - You are about to drop the column `extraPriceMinor` on the `TemplateHole` table. All the data in the column will be lost.
  - You are about to drop the column `extraPriceMinor` on the `TemplateSize` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "totalMinor";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "unitPriceMinor";

-- AlterTable
ALTER TABLE "Size" ADD COLUMN     "priceMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "basePriceMinor";

-- AlterTable
ALTER TABLE "TemplateBackground" DROP COLUMN "extraPriceMinor";

-- AlterTable
ALTER TABLE "TemplateFinish" DROP COLUMN "extraPriceMinor";

-- AlterTable
ALTER TABLE "TemplateFrame" DROP COLUMN "extraPriceMinor";

-- AlterTable
ALTER TABLE "TemplateHole" DROP COLUMN "extraPriceMinor";

-- AlterTable
ALTER TABLE "TemplateSize" DROP COLUMN "extraPriceMinor";

-- CreateTable
CREATE TABLE "MaterialHolePrice" (
    "material" "Material" NOT NULL,
    "perHoleMinor" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MaterialHolePrice_pkey" PRIMARY KEY ("material")
);

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('KZT', 'RUB');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'RUB',
ADD COLUMN     "totalMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "unitPriceMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "basePriceMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TemplateBackground" ADD COLUMN     "extraPriceMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TemplateFinish" ADD COLUMN     "extraPriceMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TemplateFrame" ADD COLUMN     "extraPriceMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TemplateHole" ADD COLUMN     "extraPriceMinor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TemplateSize" ADD COLUMN     "extraPriceMinor" INTEGER NOT NULL DEFAULT 0;

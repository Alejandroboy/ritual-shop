-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "perHolePrice" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TemplateSize" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0;

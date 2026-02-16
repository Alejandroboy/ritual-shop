-- AlterTable
ALTER TABLE "TemplateFinish" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sizeId" INTEGER;

-- AddForeignKey
ALTER TABLE "TemplateFinish" ADD CONSTRAINT "TemplateFinish_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

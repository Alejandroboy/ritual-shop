/*
  Warnings:

  - You are about to drop the column `price` on the `TemplateFinish` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `TemplateFinish` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TemplateFinish" DROP CONSTRAINT "TemplateFinish_sizeId_fkey";

-- AlterTable
ALTER TABLE "TemplateFinish" DROP COLUMN "price",
DROP COLUMN "sizeId";

-- CreateTable
CREATE TABLE "TemplateSizeFinishPrice" (
    "templateId" TEXT NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "finish" "Finish" NOT NULL,
    "priceMinor" INTEGER NOT NULL,

    CONSTRAINT "TemplateSizeFinishPrice_pkey" PRIMARY KEY ("templateId","sizeId","finish")
);

-- AddForeignKey
ALTER TABLE "TemplateSizeFinishPrice" ADD CONSTRAINT "TemplateSizeFinishPrice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSizeFinishPrice" ADD CONSTRAINT "TemplateSizeFinishPrice_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

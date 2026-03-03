/*
  Warnings:

  - The primary key for the `Template` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Template` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TemplateBackground` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateFinish` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateFrame` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateHole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateSize` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateSizeFinishPrice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateVariant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateVariantFinish` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `templateId` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateBackground` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateFinish` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateFrame` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateHole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateSize` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateSizeFinishPrice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateVariant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateVariantFinish` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateBackground" DROP CONSTRAINT "TemplateBackground_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateFinish" DROP CONSTRAINT "TemplateFinish_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateFrame" DROP CONSTRAINT "TemplateFrame_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateHole" DROP CONSTRAINT "TemplateHole_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateSize" DROP CONSTRAINT "TemplateSize_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateSizeFinishPrice" DROP CONSTRAINT "TemplateSizeFinishPrice_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateVariant" DROP CONSTRAINT "TemplateVariant_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateVariantFinish" DROP CONSTRAINT "TemplateVariantFinish_templateId_holePattern_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Template" DROP CONSTRAINT "Template_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Template_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TemplateBackground" DROP CONSTRAINT "TemplateBackground_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateBackground_pkey" PRIMARY KEY ("templateId", "backgroundId");

-- AlterTable
ALTER TABLE "TemplateFinish" DROP CONSTRAINT "TemplateFinish_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateFinish_pkey" PRIMARY KEY ("templateId", "finish");

-- AlterTable
ALTER TABLE "TemplateFrame" DROP CONSTRAINT "TemplateFrame_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateFrame_pkey" PRIMARY KEY ("templateId", "frameId");

-- AlterTable
ALTER TABLE "TemplateHole" DROP CONSTRAINT "TemplateHole_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateHole_pkey" PRIMARY KEY ("templateId", "pattern");

-- AlterTable
ALTER TABLE "TemplateSize" DROP CONSTRAINT "TemplateSize_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateSize_pkey" PRIMARY KEY ("templateId", "sizeId");

-- AlterTable
ALTER TABLE "TemplateSizeFinishPrice" DROP CONSTRAINT "TemplateSizeFinishPrice_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateSizeFinishPrice_pkey" PRIMARY KEY ("templateId", "sizeId", "finish");

-- AlterTable
ALTER TABLE "TemplateVariant" DROP CONSTRAINT "TemplateVariant_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateVariant_pkey" PRIMARY KEY ("templateId", "holePattern");

-- AlterTable
ALTER TABLE "TemplateVariantFinish" DROP CONSTRAINT "TemplateVariantFinish_pkey",
DROP COLUMN "templateId",
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD CONSTRAINT "TemplateVariantFinish_pkey" PRIMARY KEY ("templateId", "holePattern", "finishId");

-- CreateIndex
CREATE INDEX "OrderItem_templateId_idx" ON "OrderItem"("templateId");

-- AddForeignKey
ALTER TABLE "TemplateSize" ADD CONSTRAINT "TemplateSize_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateHole" ADD CONSTRAINT "TemplateHole_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateFrame" ADD CONSTRAINT "TemplateFrame_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateBackground" ADD CONSTRAINT "TemplateBackground_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateFinish" ADD CONSTRAINT "TemplateFinish_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVariant" ADD CONSTRAINT "TemplateVariant_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSizeFinishPrice" ADD CONSTRAINT "TemplateSizeFinishPrice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVariantFinish" ADD CONSTRAINT "TemplateVariantFinish_templateId_holePattern_fkey" FOREIGN KEY ("templateId", "holePattern") REFERENCES "TemplateVariant"("templateId", "holePattern") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

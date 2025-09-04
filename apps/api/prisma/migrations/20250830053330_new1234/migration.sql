/*
  Warnings:

  - You are about to drop the column `family` on the `Template` table. All the data in the column will be lost.
  - Added the required column `material` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Material" AS ENUM ('CERMET', 'WHITE_CERAMIC_GRANITE', 'BLACK_CERAMIC_GRANITE', 'GLASS', 'GROWTH_PHOTOCERAMICS', 'ENGRAVING');

-- DropIndex
DROP INDEX "public"."Template_family_shape_idx";

-- AlterTable
ALTER TABLE "public"."Template" DROP COLUMN "family",
ADD COLUMN     "material" "public"."Material" NOT NULL;

-- DropEnum
DROP TYPE "public"."Family";

-- CreateIndex
CREATE INDEX "Template_material_shape_idx" ON "public"."Template"("material", "shape");

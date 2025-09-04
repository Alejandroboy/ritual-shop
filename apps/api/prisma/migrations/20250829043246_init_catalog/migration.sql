-- CreateEnum
CREATE TYPE "public"."Family" AS ENUM ('CERMET', 'WHITE_CERAMIC_GRANITE', 'BLACK_CERAMIC_GRANITE', 'GLASS', 'GROWTH_PHOTOCERAMICS', 'ENGRAVING');

-- CreateEnum
CREATE TYPE "public"."Shape" AS ENUM ('RECTANGLE', 'OVAL', 'ARCH', 'STAR', 'HEART');

-- CreateEnum
CREATE TYPE "public"."Orientation" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- CreateEnum
CREATE TYPE "public"."ColorMode" AS ENUM ('BW', 'COLOR');

-- CreateEnum
CREATE TYPE "public"."Coverage" AS ENUM ('NORMAL', 'FULL_WRAP');

-- CreateEnum
CREATE TYPE "public"."HolePattern" AS ENUM ('NONE', 'TWO_HORIZONTAL', 'TWO_VERTICAL', 'FOUR_CORNERS');

-- CreateEnum
CREATE TYPE "public"."Finish" AS ENUM ('MATTE', 'GLOSS');

-- CreateEnum
CREATE TYPE "public"."AssetKind" AS ENUM ('PHOTO', 'REFERENCE', 'DOCUMENT');

-- CreateTable
CREATE TABLE "public"."Size" (
    "id" SERIAL NOT NULL,
    "widthCm" INTEGER NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Frame" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Frame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Background" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Background_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Template" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "family" "public"."Family" NOT NULL,
    "shape" "public"."Shape" NOT NULL,
    "orientation" "public"."Orientation",
    "colorMode" "public"."ColorMode" NOT NULL,
    "coverage" "public"."Coverage" NOT NULL DEFAULT 'NORMAL',
    "supportsFrame" BOOLEAN NOT NULL DEFAULT false,
    "requiresBackground" BOOLEAN NOT NULL DEFAULT false,
    "requiresFinish" BOOLEAN NOT NULL DEFAULT false,
    "supportsHoles" BOOLEAN NOT NULL DEFAULT true,
    "personsMin" INTEGER NOT NULL DEFAULT 1,
    "personsMax" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateSize" (
    "templateId" TEXT NOT NULL,
    "sizeId" INTEGER NOT NULL,

    CONSTRAINT "TemplateSize_pkey" PRIMARY KEY ("templateId","sizeId")
);

-- CreateTable
CREATE TABLE "public"."TemplateHole" (
    "templateId" TEXT NOT NULL,
    "pattern" "public"."HolePattern" NOT NULL,

    CONSTRAINT "TemplateHole_pkey" PRIMARY KEY ("templateId","pattern")
);

-- CreateTable
CREATE TABLE "public"."TemplateFrame" (
    "templateId" TEXT NOT NULL,
    "frameId" INTEGER NOT NULL,

    CONSTRAINT "TemplateFrame_pkey" PRIMARY KEY ("templateId","frameId")
);

-- CreateTable
CREATE TABLE "public"."TemplateBackground" (
    "templateId" TEXT NOT NULL,
    "backgroundId" INTEGER NOT NULL,

    CONSTRAINT "TemplateBackground_pkey" PRIMARY KEY ("templateId","backgroundId")
);

-- CreateTable
CREATE TABLE "public"."TemplateFinish" (
    "templateId" TEXT NOT NULL,
    "finish" "public"."Finish" NOT NULL,

    CONSTRAINT "TemplateFinish_pkey" PRIMARY KEY ("templateId","finish")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "intakePoint" TEXT,
    "delivery" TEXT,
    "intakeDate" TIMESTAMP(3),
    "approveNeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sizeId" INTEGER,
    "holePattern" "public"."HolePattern",
    "frameId" INTEGER,
    "backgroundId" INTEGER,
    "finish" "public"."Finish",
    "comment" TEXT,
    "templateCode" TEXT NOT NULL,
    "templateLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItemPerson" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "lastName" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),

    CONSTRAINT "OrderItemPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "kind" "public"."AssetKind" NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Size_heightCm_widthCm_idx" ON "public"."Size"("heightCm", "widthCm");

-- CreateIndex
CREATE UNIQUE INDEX "Size_widthCm_heightCm_key" ON "public"."Size"("widthCm", "heightCm");

-- CreateIndex
CREATE UNIQUE INDEX "Frame_code_key" ON "public"."Frame"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Background_code_key" ON "public"."Background"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Template_code_key" ON "public"."Template"("code");

-- CreateIndex
CREATE INDEX "Template_family_shape_idx" ON "public"."Template"("family", "shape");

-- CreateIndex
CREATE INDEX "Template_colorMode_idx" ON "public"."Template"("colorMode");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "public"."Order"("number");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_templateId_idx" ON "public"."OrderItem"("templateId");

-- CreateIndex
CREATE INDEX "OrderItem_sizeId_idx" ON "public"."OrderItem"("sizeId");

-- CreateIndex
CREATE INDEX "OrderItem_frameId_idx" ON "public"."OrderItem"("frameId");

-- CreateIndex
CREATE INDEX "OrderItem_backgroundId_idx" ON "public"."OrderItem"("backgroundId");

-- CreateIndex
CREATE INDEX "OrderItemPerson_itemId_idx" ON "public"."OrderItemPerson"("itemId");

-- CreateIndex
CREATE INDEX "Asset_itemId_idx" ON "public"."Asset"("itemId");

-- AddForeignKey
ALTER TABLE "public"."TemplateSize" ADD CONSTRAINT "TemplateSize_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateSize" ADD CONSTRAINT "TemplateSize_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "public"."Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateHole" ADD CONSTRAINT "TemplateHole_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateFrame" ADD CONSTRAINT "TemplateFrame_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateFrame" ADD CONSTRAINT "TemplateFrame_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "public"."Frame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateBackground" ADD CONSTRAINT "TemplateBackground_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateBackground" ADD CONSTRAINT "TemplateBackground_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "public"."Background"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateFinish" ADD CONSTRAINT "TemplateFinish_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "public"."Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "public"."Frame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "public"."Background"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItemPerson" ADD CONSTRAINT "OrderItemPerson_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."TemplateVariant" (
    "templateId" TEXT NOT NULL,
    "holePattern" "public"."HolePattern" NOT NULL,
    "finishRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemplateVariant_pkey" PRIMARY KEY ("templateId","holePattern")
);

-- CreateTable
CREATE TABLE "public"."FinishVariant" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "FinishVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateVariantFinish" (
    "templateId" TEXT NOT NULL,
    "holePattern" "public"."HolePattern" NOT NULL,
    "finishId" INTEGER NOT NULL,

    CONSTRAINT "TemplateVariantFinish_pkey" PRIMARY KEY ("templateId","holePattern","finishId")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinishVariant_code_key" ON "public"."FinishVariant"("code");

-- AddForeignKey
ALTER TABLE "public"."TemplateVariant" ADD CONSTRAINT "TemplateVariant_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateVariantFinish" ADD CONSTRAINT "TemplateVariantFinish_templateId_holePattern_fkey" FOREIGN KEY ("templateId", "holePattern") REFERENCES "public"."TemplateVariant"("templateId", "holePattern") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateVariantFinish" ADD CONSTRAINT "TemplateVariantFinish_finishId_fkey" FOREIGN KEY ("finishId") REFERENCES "public"."FinishVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "TemplateGoldType" (
    "templateId" INTEGER NOT NULL,
    "goldType" TEXT NOT NULL,

    CONSTRAINT "TemplateGoldType_pkey" PRIMARY KEY ("templateId","goldType")
);

-- AddForeignKey
ALTER TABLE "TemplateGoldType" ADD CONSTRAINT "TemplateGoldType_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

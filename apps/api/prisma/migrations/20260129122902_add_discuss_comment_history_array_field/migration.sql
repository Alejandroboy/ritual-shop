-- CreateTable
CREATE TABLE "DiscussComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderItemId" TEXT,

    CONSTRAINT "DiscussComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscussComment" ADD CONSTRAINT "DiscussComment_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

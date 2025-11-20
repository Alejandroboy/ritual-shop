/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- Добавляем колонку, если её ещё нет
ALTER TABLE "OrderItem"
ADD COLUMN IF NOT EXISTS "discussComment" TEXT;

-- Создаём уникальный индекс по orderId, если его ещё нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'OrderItem_orderId_key'
      AND n.nspname = 'public'
  ) THEN
    CREATE UNIQUE INDEX "OrderItem_orderId_key"
      ON "OrderItem"("orderId");
  END IF;
END $$;

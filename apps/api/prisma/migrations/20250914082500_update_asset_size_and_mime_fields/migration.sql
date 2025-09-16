/*
  Warnings:

  - The `size` column on the `Asset` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Asset" ALTER COLUMN "mime" DROP NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER;

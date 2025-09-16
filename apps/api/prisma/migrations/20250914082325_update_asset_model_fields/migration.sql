/*
  Warnings:

  - Added the required column `mime` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Asset" ADD COLUMN     "mime" TEXT NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL;

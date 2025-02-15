/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `buyers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `sellers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `sellers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "buyers" DROP CONSTRAINT "buyers_id_fkey";

-- DropForeignKey
ALTER TABLE "sellers" DROP CONSTRAINT "sellers_id_fkey";

-- AlterTable
ALTER TABLE "buyers" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_details" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "fabricType" JSONB NOT NULL,
    "origin" TEXT NOT NULL,
    "closureType" TEXT NOT NULL,
    "countryOfOrigin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "product_details_productId_key" ON "product_details"("productId");

-- CreateIndex
CREATE INDEX "product_details_countryOfOrigin_idx" ON "product_details"("countryOfOrigin");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_userId_key" ON "buyers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_userId_key" ON "sellers"("userId");

-- AddForeignKey
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellers" ADD CONSTRAINT "sellers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_details" ADD CONSTRAINT "product_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

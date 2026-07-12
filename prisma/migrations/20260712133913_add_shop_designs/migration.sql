-- CreateTable
CREATE TABLE "ShopDesign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopDesign_published_idx" ON "ShopDesign"("published");

-- CreateIndex
CREATE INDEX "ShopDesign_featured_idx" ON "ShopDesign"("featured");

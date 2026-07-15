-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "links" TEXT NOT NULL DEFAULT '[]',
    "tag" TEXT NOT NULL DEFAULT 'Partner',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN "discordMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_discordMessageId_key" ON "Announcement"("discordMessageId");

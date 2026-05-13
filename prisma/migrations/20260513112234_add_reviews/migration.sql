-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "propertySlug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "origin" TEXT,
    "body" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "categoryRatings" TEXT NOT NULL DEFAULT '{}',
    "authorImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_propertySlug_status_idx" ON "Review"("propertySlug", "status");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

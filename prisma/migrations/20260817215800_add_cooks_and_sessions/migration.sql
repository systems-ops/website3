-- CreateTable
CREATE TABLE "cooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "cook_locations" (
    "cookId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    PRIMARY KEY ("cookId", "locationId"),
    CONSTRAINT "cook_locations_cookId_fkey" FOREIGN KEY ("cookId") REFERENCES "cooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cook_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "sessions_cookId_fkey" FOREIGN KEY ("cookId") REFERENCES "cooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "sessions_cookId_idx" ON "sessions"("cookId");

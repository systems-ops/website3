-- CreateTable
CREATE TABLE "location_log_kinds" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayLabel" TEXT,
    "formReference" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "location_log_kinds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_log_kinds_locationId_logDefinitionId_key" ON "location_log_kinds"("locationId", "logDefinitionId");

-- AddForeignKey
ALTER TABLE "location_log_kinds" ADD CONSTRAINT "location_log_kinds_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_log_kinds" ADD CONSTRAINT "location_log_kinds_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

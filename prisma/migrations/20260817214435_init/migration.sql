-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "log_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "formCode" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "unit" TEXT,
    "slots" JSONB,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "log_units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logDefinitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "low" REAL NOT NULL,
    "high" REAL NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "unitOverride" TEXT,
    CONSTRAINT "log_units_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logDefinitionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "log_items_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "corrective_action_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logDefinitionId" TEXT,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "corrective_action_options_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "certificate_requirements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certificateId" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "locationId" TEXT,
    "frequency" TEXT NOT NULL,
    CONSTRAINT "certificate_requirements_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "certificate_requirements_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "certificate_requirements_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT NOT NULL,
    "signatureName" TEXT NOT NULL,
    "amendsId" TEXT,
    CONSTRAINT "log_entries_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "log_entries_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "log_entries_amendsId_fkey" FOREIGN KEY ("amendsId") REFERENCES "log_entries" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "readings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logEntryId" TEXT NOT NULL,
    "logUnitId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "value" REAL NOT NULL,
    "outOfSpec" BOOLEAN NOT NULL,
    "specLow" REAL NOT NULL,
    "specHigh" REAL NOT NULL,
    "specUnitOverride" TEXT,
    "correctiveAction" TEXT,
    CONSTRAINT "readings_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "readings_logUnitId_fkey" FOREIGN KEY ("logUnitId") REFERENCES "log_units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "item_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logEntryId" TEXT NOT NULL,
    "logItemId" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL,
    CONSTRAINT "item_checks_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "item_checks_logItemId_fkey" FOREIGN KEY ("logItemId") REFERENCES "log_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_name_key" ON "locations"("name");

-- CreateIndex
CREATE INDEX "log_units_logDefinitionId_idx" ON "log_units"("logDefinitionId");

-- CreateIndex
CREATE INDEX "log_items_logDefinitionId_idx" ON "log_items"("logDefinitionId");

-- CreateIndex
CREATE INDEX "corrective_action_options_logDefinitionId_idx" ON "corrective_action_options"("logDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_name_key" ON "certificates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_requirements_certificateId_logDefinitionId_locationId_key" ON "certificate_requirements"("certificateId", "logDefinitionId", "locationId");

-- CreateIndex
CREATE INDEX "log_entries_locationId_logDefinitionId_businessDate_idx" ON "log_entries"("locationId", "logDefinitionId", "businessDate");

-- CreateIndex
CREATE INDEX "readings_logUnitId_idx" ON "readings"("logUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "readings_logEntryId_logUnitId_slotIndex_key" ON "readings"("logEntryId", "logUnitId", "slotIndex");

-- CreateIndex
CREATE INDEX "item_checks_logItemId_idx" ON "item_checks"("logItemId");

-- CreateIndex
CREATE UNIQUE INDEX "item_checks_logEntryId_logItemId_key" ON "item_checks"("logEntryId", "logItemId");

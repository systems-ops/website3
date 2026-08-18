-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cook_locations" (
    "cookId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "cook_locations_pkey" PRIMARY KEY ("cookId","locationId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "cookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "formCode" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "unit" TEXT,
    "slots" JSONB,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "log_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_units" (
    "id" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "unitOverride" TEXT,

    CONSTRAINT "log_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_items" (
    "id" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "log_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_options" (
    "id" TEXT NOT NULL,
    "logDefinitionId" TEXT,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "corrective_action_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_requirements" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "locationId" TEXT,
    "frequency" TEXT NOT NULL,

    CONSTRAINT "certificate_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_entries" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT NOT NULL,
    "signatureName" TEXT NOT NULL,
    "amendsId" TEXT,

    CONSTRAINT "log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readings" (
    "id" TEXT NOT NULL,
    "logEntryId" TEXT NOT NULL,
    "logUnitId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "outOfSpec" BOOLEAN NOT NULL,
    "specLow" DOUBLE PRECISION NOT NULL,
    "specHigh" DOUBLE PRECISION NOT NULL,
    "specUnitOverride" TEXT,
    "correctiveAction" TEXT,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_checks" (
    "id" TEXT NOT NULL,
    "logEntryId" TEXT NOT NULL,
    "logItemId" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL,

    CONSTRAINT "item_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_name_key" ON "locations"("name");

-- CreateIndex
CREATE INDEX "sessions_cookId_idx" ON "sessions"("cookId");

-- CreateIndex
CREATE INDEX "log_units_logDefinitionId_idx" ON "log_units"("logDefinitionId");

-- CreateIndex
CREATE INDEX "log_items_logDefinitionId_idx" ON "log_items"("logDefinitionId");

-- CreateIndex
CREATE INDEX "corrective_action_options_logDefinitionId_idx" ON "corrective_action_options"("logDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_name_key" ON "certificates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_requirements_certificateId_logDefinitionId_loca_key" ON "certificate_requirements"("certificateId", "logDefinitionId", "locationId");

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

-- AddForeignKey
ALTER TABLE "cook_locations" ADD CONSTRAINT "cook_locations_cookId_fkey" FOREIGN KEY ("cookId") REFERENCES "cooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cook_locations" ADD CONSTRAINT "cook_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_cookId_fkey" FOREIGN KEY ("cookId") REFERENCES "cooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_units" ADD CONSTRAINT "log_units_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_items" ADD CONSTRAINT "log_items_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_options" ADD CONSTRAINT "corrective_action_options_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requirements" ADD CONSTRAINT "certificate_requirements_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requirements" ADD CONSTRAINT "certificate_requirements_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requirements" ADD CONSTRAINT "certificate_requirements_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_amendsId_fkey" FOREIGN KEY ("amendsId") REFERENCES "log_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_logUnitId_fkey" FOREIGN KEY ("logUnitId") REFERENCES "log_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_checks" ADD CONSTRAINT "item_checks_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_checks" ADD CONSTRAINT "item_checks_logItemId_fkey" FOREIGN KEY ("logItemId") REFERENCES "log_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "managers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_sessions" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibration_rows" (
    "id" TEXT NOT NULL,
    "logEntryId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "testTermId" TEXT NOT NULL,
    "referenceReading" DOUBLE PRECISION NOT NULL,
    "testReading" DOUBLE PRECISION NOT NULL,
    "adjustmentRequired" BOOLEAN NOT NULL,
    "comments" TEXT,

    CONSTRAINT "calibration_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manager_sessions_managerId_idx" ON "manager_sessions"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "calibration_rows_logEntryId_rowIndex_key" ON "calibration_rows"("logEntryId", "rowIndex");

-- AddForeignKey
ALTER TABLE "manager_sessions" ADD CONSTRAINT "manager_sessions_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "managers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_rows" ADD CONSTRAINT "calibration_rows_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

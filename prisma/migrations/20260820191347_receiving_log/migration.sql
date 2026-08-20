-- CreateTable
CREATE TABLE "receiving_details" (
    "id" TEXT NOT NULL,
    "logEntryId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "distributorName" TEXT NOT NULL,
    "wfcfoApproved" BOOLEAN NOT NULL,
    "wfcfoExplain" TEXT,
    "nonGmoApproved" BOOLEAN NOT NULL,
    "nonGmoExplain" TEXT,
    "truckConditionGood" BOOLEAN NOT NULL,
    "truckConditionExplain" TEXT,
    "truckTempCompliant" BOOLEAN NOT NULL,
    "truckTempF" DOUBLE PRECISION,
    "palletConditionGood" BOOLEAN NOT NULL,
    "plasticWrapGood" BOOLEAN NOT NULL,
    "productsToStandard" BOOLEAN NOT NULL,
    "productsToStandardExplain" TEXT,
    "labelsCurrent" BOOLEAN NOT NULL,
    "labelsCurrentExplain" TEXT,

    CONSTRAINT "receiving_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receiving_lines" (
    "id" TEXT NOT NULL,
    "receivingDetailId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productId" TEXT,
    "productCount" TEXT,
    "lotNumber" TEXT,
    "allergenProduct" BOOLEAN NOT NULL,
    "labeledOrganic" BOOLEAN NOT NULL,
    "storageType" TEXT NOT NULL,

    CONSTRAINT "receiving_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receiving_reviews" (
    "id" TEXT NOT NULL,
    "logEntryId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCount" INTEGER,
    "countTested" INTEGER,
    "standardsReviewed" TEXT,
    "coaReference" TEXT,
    "approved" BOOLEAN NOT NULL,
    "rejectedReason" TEXT,
    "storageLocation" TEXT,
    "storageCcps" TEXT,
    "comments" TEXT,
    "releasedForUse" BOOLEAN NOT NULL,

    CONSTRAINT "receiving_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receiving_details_logEntryId_key" ON "receiving_details"("logEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "receiving_lines_receivingDetailId_rowIndex_key" ON "receiving_lines"("receivingDetailId", "rowIndex");

-- CreateIndex
CREATE UNIQUE INDEX "receiving_reviews_logEntryId_key" ON "receiving_reviews"("logEntryId");

-- AddForeignKey
ALTER TABLE "receiving_details" ADD CONSTRAINT "receiving_details_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_lines" ADD CONSTRAINT "receiving_lines_receivingDetailId_fkey" FOREIGN KEY ("receivingDetailId") REFERENCES "receiving_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_reviews" ADD CONSTRAINT "receiving_reviews_logEntryId_fkey" FOREIGN KEY ("logEntryId") REFERENCES "log_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_reviews" ADD CONSTRAINT "receiving_reviews_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "managers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

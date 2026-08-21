-- CreateTable
CREATE TABLE "production_batches" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "quantity" TEXT,
    "producedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT NOT NULL,
    "signatureName" TEXT NOT NULL,
    "enteredLate" BOOLEAN NOT NULL DEFAULT false,
    "lateReason" TEXT,

    CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_inputs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "receivingLineId" TEXT NOT NULL,
    "productNameSnapshot" TEXT NOT NULL,
    "supplierLotNumber" TEXT,

    CONSTRAINT "batch_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_outputs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" TEXT,
    "bakeDate" TEXT NOT NULL,
    "bestByDate" TEXT,
    "disposition" TEXT NOT NULL,
    "reference" TEXT,

    CONSTRAINT "batch_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "production_batches_locationId_batchCode_key" ON "production_batches"("locationId", "batchCode");

-- CreateIndex
CREATE UNIQUE INDEX "batch_inputs_batchId_receivingLineId_key" ON "batch_inputs"("batchId", "receivingLineId");

-- AddForeignKey
ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_inputs" ADD CONSTRAINT "batch_inputs_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "production_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_inputs" ADD CONSTRAINT "batch_inputs_receivingLineId_fkey" FOREIGN KEY ("receivingLineId") REFERENCES "receiving_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_outputs" ADD CONSTRAINT "batch_outputs_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "production_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

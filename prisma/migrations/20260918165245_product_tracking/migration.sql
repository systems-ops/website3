-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "shelfLifeDays" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "low_stock_flags" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raisedBy" TEXT NOT NULL,
    "raisedSignatureName" TEXT NOT NULL,
    "raiseCount" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "clearedDisposition" TEXT,
    "clearedAt" TIMESTAMP(3),
    "clearedBy" TEXT,
    "clearedSignatureName" TEXT,

    CONSTRAINT "low_stock_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_items" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productNameSnapshot" TEXT NOT NULL,
    "receivingLineId" TEXT,
    "supplierLotSnapshot" TEXT,
    "sourceText" TEXT,
    "openedDate" TEXT NOT NULL,
    "useByDate" TEXT NOT NULL,
    "storageLocation" TEXT,
    "openedBy" TEXT NOT NULL,
    "openedSignatureName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disposition" TEXT NOT NULL DEFAULT 'ON_HAND',
    "discardedAt" TIMESTAMP(3),
    "discardedBy" TEXT,
    "discardedSignatureName" TEXT,
    "discardReason" TEXT,

    CONSTRAINT "open_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_locationId_name_key" ON "products"("locationId", "name");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "low_stock_flags" ADD CONSTRAINT "low_stock_flags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "low_stock_flags" ADD CONSTRAINT "low_stock_flags_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_items" ADD CONSTRAINT "open_items_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_items" ADD CONSTRAINT "open_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_items" ADD CONSTRAINT "open_items_receivingLineId_fkey" FOREIGN KEY ("receivingLineId") REFERENCES "receiving_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

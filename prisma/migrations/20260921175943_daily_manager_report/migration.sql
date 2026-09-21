-- CreateTable
CREATE TABLE "report_recipients" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report_log" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientCount" INTEGER NOT NULL,

    CONSTRAINT "daily_report_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_recipients_locationId_email_key" ON "report_recipients"("locationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "daily_report_log_locationId_businessDate_key" ON "daily_report_log"("locationId", "businessDate");

-- AddForeignKey
ALTER TABLE "report_recipients" ADD CONSTRAINT "report_recipients_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_report_log" ADD CONSTRAINT "daily_report_log_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

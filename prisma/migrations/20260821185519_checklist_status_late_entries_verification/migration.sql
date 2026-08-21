-- AlterTable: item_checks.checked -> status
-- Every existing row has checked=true (submitting a FAIL was impossible
-- before this migration), so the backfill is unambiguous: PASS.
ALTER TABLE "item_checks" ADD COLUMN     "status" TEXT,
ADD COLUMN     "statusNote" TEXT;

UPDATE "item_checks" SET "status" = CASE WHEN "checked" THEN 'PASS' ELSE 'FAIL' END;

ALTER TABLE "item_checks" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "item_checks" DROP COLUMN "checked";

-- AlterTable
ALTER TABLE "log_entries" ADD COLUMN     "amendReason" TEXT,
ADD COLUMN     "enteredLate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lateReason" TEXT;

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verifications_locationId_weekStart_key" ON "verifications"("locationId", "weekStart");

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "managers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

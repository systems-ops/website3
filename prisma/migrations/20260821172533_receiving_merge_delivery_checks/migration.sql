-- AlterTable
-- Existing rows (submitted before this merge) default to true — they predate
-- these checks, so there's nothing to flag retroactively. New rows always
-- supply a real value; the app layer never relies on this default.
ALTER TABLE "receiving_details" ADD COLUMN     "caseCountMatches" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "organicCertCurrent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sealIntact" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "supplierPaperworkAttached" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "receiving_details" ALTER COLUMN "caseCountMatches" DROP DEFAULT,
ALTER COLUMN "organicCertCurrent" DROP DEFAULT,
ALTER COLUMN "sealIntact" DROP DEFAULT,
ALTER COLUMN "supplierPaperworkAttached" DROP DEFAULT;

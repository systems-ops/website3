-- AlterTable
ALTER TABLE "log_entries" ADD COLUMN     "shift" TEXT NOT NULL DEFAULT 'ALL_DAY';

-- AlterTable
ALTER TABLE "log_items" ADD COLUMN     "shift" TEXT;

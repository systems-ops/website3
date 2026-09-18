-- CreateTable
CREATE TABLE "sidework_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "locationIds" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sidework_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sidework_completions" (
    "id" TEXT NOT NULL,
    "sideworkTaskId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "claimedBy" TEXT,
    "claimedSignatureName" TEXT,
    "claimedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "completedSignatureName" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "sidework_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sidework_completions_sideworkTaskId_locationId_businessDate_key" ON "sidework_completions"("sideworkTaskId", "locationId", "businessDate");

-- AddForeignKey
ALTER TABLE "sidework_completions" ADD CONSTRAINT "sidework_completions_sideworkTaskId_fkey" FOREIGN KEY ("sideworkTaskId") REFERENCES "sidework_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sidework_completions" ADD CONSTRAINT "sidework_completions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

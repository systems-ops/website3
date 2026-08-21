-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "locationId" TEXT,
    "ip" TEXT NOT NULL,
    "succeeded" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_attempts_kind_locationId_ip_createdAt_idx" ON "login_attempts"("kind", "locationId", "ip", "createdAt");

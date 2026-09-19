-- CreateTable
CREATE TABLE "training_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "applicableRoles" TEXT[],
    "applicableLocationIds" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "training_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_resource_links" (
    "id" TEXT NOT NULL,
    "trainingResourceId" TEXT NOT NULL,
    "logDefinitionId" TEXT NOT NULL,
    "logItemId" TEXT,

    CONSTRAINT "training_resource_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_resource_links_trainingResourceId_logDefinitionId__key" ON "training_resource_links"("trainingResourceId", "logDefinitionId", "logItemId");

-- AddForeignKey
ALTER TABLE "training_resource_links" ADD CONSTRAINT "training_resource_links_trainingResourceId_fkey" FOREIGN KEY ("trainingResourceId") REFERENCES "training_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_resource_links" ADD CONSTRAINT "training_resource_links_logDefinitionId_fkey" FOREIGN KEY ("logDefinitionId") REFERENCES "log_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_resource_links" ADD CONSTRAINT "training_resource_links_logItemId_fkey" FOREIGN KEY ("logItemId") REFERENCES "log_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

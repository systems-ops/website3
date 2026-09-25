-- AlterTable
ALTER TABLE "log_items" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- Client feedback round 1.

-- 1. Chlorine testing and thermometer calibration were already supposed to
--    be disabled at the two restaurants (see the earlier
--    20260918161605_disable_chlorine_calibration_at_restaurants migration).
--    Re-asserting it here is a harmless no-op if it already took effect,
--    and a real fix if that migration hasn't reached this database yet.
--    Pre-production inspection (id "clean") is newly added to the same
--    restaurant-only-disabled set per this feedback round.
UPDATE "location_log_kinds"
SET "enabled" = false
WHERE "logDefinitionId" IN ('chlorine', 'thermometer-calibration', 'clean')
  AND "locationId" IN (
    SELECT "id" FROM "locations" WHERE "name" IN ('Hot Italian', 'Passione Emporio')
  );

-- 2. Restroom cleaning (id "restroom") removed entirely, at every location
--    — same "deactivate, never delete" treatment as the retired FR-02
--    delivery form: existing history stays intact, it just stops
--    appearing as a daily task.
UPDATE "log_definitions" SET "active" = false WHERE "id" = 'restroom';
DELETE FROM "certificate_requirements" WHERE "logDefinitionId" = 'restroom';

-- 3. Combine near-duplicate "wash X" / "clean X" items on the Hygiene
--    inspection checklist (id "hygiene") into fewer, grouped items — the
--    superseded rows are deactivated, not deleted, since a past ItemCheck
--    may already reference one by id and needs its original label intact.
--    The application layer (seed.ts) creates the new combined items on
--    next seed run; this migration only has to retire the old ones so
--    they stop appearing on the live form regardless of whether seed runs
--    before this deploy's build completes.
UPDATE "log_items" SET "active" = false
WHERE "logDefinitionId" = 'hygiene' AND "label" IN (
  'Wash all surfaces',
  'Wash all tables',
  'Wash all mixing bowls',
  'Wash all scales',
  'Wash baking tins',
  'Wash white trays',
  'Wash metal baking racks',
  'Clean dough mixer',
  'Clean dough divider',
  'Clean rounder',
  'Clean former',
  'Clean employee break room',
  'Clean employee restroom'
);

-- 4. Same combining treatment for Pre-production inspection (id "clean").
UPDATE "log_items" SET "active" = false
WHERE "logDefinitionId" = 'clean' AND "label" IN (
  'Floors are clean',
  'All surfaces, tables, mixing bowls, scales, baking tins, white trays are clean',
  'All wood boards are free of debris and residue',
  'Dough mixer is clean',
  'Divider and rounder is clean',
  'Forming machine is cool and clean',
  'Saucing machine is clean and dry'
);

-- 5. Insert the new combined items directly (rather than relying on the
--    next `prisma db seed` run, which isn't part of the deploy build) so
--    both checklists are immediately correct after this migration, not
--    just missing-items-until-someone-remembers-to-seed. Guarded by
--    NOT EXISTS so a later seed run (which upserts by label) never
--    creates a duplicate.
INSERT INTO "log_items" ("id", "logDefinitionId", "label", "sortOrder", "shift", "active")
SELECT md5(random()::text || clock_timestamp()::text), 'hygiene',
       'Wash all surfaces, tables, mixing bowls, scales, baking tins, white trays, and metal baking racks', 0, NULL, true
WHERE EXISTS (SELECT 1 FROM "log_definitions" WHERE "id" = 'hygiene')
  AND NOT EXISTS (
    SELECT 1 FROM "log_items" WHERE "logDefinitionId" = 'hygiene'
      AND "label" = 'Wash all surfaces, tables, mixing bowls, scales, baking tins, white trays, and metal baking racks'
  );

INSERT INTO "log_items" ("id", "logDefinitionId", "label", "sortOrder", "shift", "active")
SELECT md5(random()::text || clock_timestamp()::text), 'hygiene',
       'Clean dough mixer, dough divider, rounder, and former', 2, NULL, true
WHERE EXISTS (SELECT 1 FROM "log_definitions" WHERE "id" = 'hygiene')
  AND NOT EXISTS (
    SELECT 1 FROM "log_items" WHERE "logDefinitionId" = 'hygiene'
      AND "label" = 'Clean dough mixer, dough divider, rounder, and former'
  );

INSERT INTO "log_items" ("id", "logDefinitionId", "label", "sortOrder", "shift", "active")
SELECT md5(random()::text || clock_timestamp()::text), 'hygiene',
       'Clean employee break room and restroom', 7, NULL, true
WHERE EXISTS (SELECT 1 FROM "log_definitions" WHERE "id" = 'hygiene')
  AND NOT EXISTS (
    SELECT 1 FROM "log_items" WHERE "logDefinitionId" = 'hygiene'
      AND "label" = 'Clean employee break room and restroom'
  );

INSERT INTO "log_items" ("id", "logDefinitionId", "label", "sortOrder", "shift", "active")
SELECT md5(random()::text || clock_timestamp()::text), 'clean',
       'Floors, all surfaces/tables/mixing bowls/scales/baking tins/white trays, and wood boards are clean and free of debris', 0, NULL, true
WHERE EXISTS (SELECT 1 FROM "log_definitions" WHERE "id" = 'clean')
  AND NOT EXISTS (
    SELECT 1 FROM "log_items" WHERE "logDefinitionId" = 'clean'
      AND "label" = 'Floors, all surfaces/tables/mixing bowls/scales/baking tins/white trays, and wood boards are clean and free of debris'
  );

INSERT INTO "log_items" ("id", "logDefinitionId", "label", "sortOrder", "shift", "active")
SELECT md5(random()::text || clock_timestamp()::text), 'clean',
       'Dough mixer, divider/rounder, forming machine, and saucing machine are clean', 3, NULL, true
WHERE EXISTS (SELECT 1 FROM "log_definitions" WHERE "id" = 'clean')
  AND NOT EXISTS (
    SELECT 1 FROM "log_items" WHERE "logDefinitionId" = 'clean'
      AND "label" = 'Dough mixer, divider/rounder, forming machine, and saucing machine are clean'
  );

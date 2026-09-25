-- Client feedback round 1, fix.
--
-- The disable in 20260921184249_log_item_active_and_content_combining (and
-- before that, 20260918161605_disable_chlorine_calibration_at_restaurants)
-- only UPDATEd existing "location_log_kinds" rows. getEnabledLogDefinitions
-- (src/lib/location-log-kinds.ts) treats a *missing* row as enabled by
-- design — a form added after a location's rows were seeded shouldn't
-- silently vanish there. But that same default means a plain UPDATE is a
-- no-op wherever a row was never created in the first place (this table is
-- only ever populated by `prisma db seed`'s upsert loop, which Vercel's
-- build does not run), so chlorine/thermometer-calibration/clean stayed
-- visible at the restaurants regardless of either "fix." This INSERT ...
-- ON CONFLICT guarantees the row exists and is disabled, however this
-- database's location_log_kinds table happens to look right now.
INSERT INTO "location_log_kinds" ("id", "locationId", "logDefinitionId", "enabled", "sortOrder")
SELECT md5(random()::text || clock_timestamp()::text || l."id" || ld."id"), l."id", ld."id", false, 0
FROM "locations" l, "log_definitions" ld
WHERE l."name" IN ('Hot Italian', 'Passione Emporio')
  AND ld."id" IN ('chlorine', 'thermometer-calibration', 'clean')
ON CONFLICT ("locationId", "logDefinitionId") DO UPDATE SET "enabled" = false;

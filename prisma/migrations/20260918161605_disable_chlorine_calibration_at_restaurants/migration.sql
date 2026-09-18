-- Item 1 decision, confirmed explicitly by the client: chlorine/sanitizer
-- testing and thermometer calibration are disabled at the restaurants
-- (Hot Italian, Passione Emporio), same as delivery truck coolers already
-- were. Still enabled at Passione Brands. A data-only migration rather than
-- relying on the seed, since the seed's LocationLogKind upsert only sets
-- `enabled` on create (not update) to avoid stomping a future manager
-- override — a database that already ran the seed before this decision
-- needs this explicit correction to actually take effect.
UPDATE "location_log_kinds"
SET "enabled" = false
WHERE "logDefinitionId" IN ('chlorine', 'thermometer-calibration')
  AND "locationId" IN (
    SELECT "id" FROM "locations" WHERE "name" IN ('Hot Italian', 'Passione Emporio')
  );

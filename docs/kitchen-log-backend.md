# Kitchen Compliance Log — backend

Backend for the Kitchen Compliance Log App (digitizing paper food-safety
forms FR-08-A, FR-08, FR-11, FR-47-A, FR-02 for Passione Brands' kitchens).
Implements the data model and API described in the design handoff
(`Kitchen Compliance Log App` prototype + README).

## Stack

- **DB**: SQLite via Prisma ORM 7 (driver adapter: `@prisma/adapter-better-sqlite3`),
  for zero-config local development. Swapping to Postgres later means changing
  `datasource.provider` in `prisma/schema.prisma` to `"postgresql"`, swapping
  the adapter in `src/lib/prisma.ts` to `@prisma/adapter-pg`, and setting
  `DATABASE_URL` — the schema itself has no SQLite-specific modeling beyond
  storing `slots` as JSON (SQLite has no native array/enum support).
- **API**: Next.js Route Handlers under `src/app/api/`.

## Setup

```bash
npm install
npm run db:migrate   # applies prisma/migrations, creates prisma/dev.db
npm run db:seed       # loads locations, forms, units/items, corrective actions, certificates
npm run dev
```

## Data model (`prisma/schema.prisma`)

Matches the design doc's five core tables plus two supporting ones:

- `locations` — the three kitchens.
- `log_definitions` — the digitized paper forms (`kind`: `"temps"` | `"check"`).
- `log_units` / `log_items` — what a temps/check form measures or lists.
- `corrective_action_options` — presets per form, with a fallback set
  (`logDefinitionId = null`).
- `certificates` / `certificate_requirements` — which logs a certificate needs,
  used to derive status instead of hardcoding it.
- `log_entries` — one row per submission. **Immutable once created.**
- `readings` / `item_checks` — one row per cell/checklist line submitted.
  A reading snapshots the spec range (`specLow`/`specHigh`) at submit time,
  so changing a unit's range later doesn't rewrite what "in range" meant for
  past records.

Corrections are new `log_entries` rows with `amendsId` pointing at the
original — never an `UPDATE` — so the audit trail is provable.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/locations` | List kitchens |
| GET | `/api/log-definitions` | Forms with units/items/corrective actions |
| GET | `/api/today?locationId=&date=` | Today tab: to-do vs done split |
| GET | `/api/log-entries?locationId=&logDefinitionId=&month=\|date=` | Records tab: history |
| POST | `/api/log-entries` | Submit a new record (one per location/form/day) |
| GET | `/api/log-entries/:id` | Single record with readings/checks/amendments |
| POST | `/api/log-entries/:id/amend` | Correct a signed record (creates a new row) |
| GET | `/api/certificates?locationId=&days=30` | Derived certificate gap status |

`POST /api/log-entries` and the `/amend` endpoint enforce the same gating
rules as the design: every cell must be filled (temps) or every item ticked
(checklists), and any out-of-spec reading needs a corrective action before
the submission is accepted.

## Known gaps (not built here)

Per the design handoff's "not built, and needed for production" list:
authentication (per-cook PIN accounts), an offline write queue, manager
review, CSV/PDF export for auditors, photo attachment on corrective actions,
Spanish localization, and the remaining ~13 paper forms. The certificate
requirements seeded in `prisma/seed.ts` (which logs each of Organic/FDA/Milk
and dairy/SQF actually requires) are a placeholder inferred from the one
example in the design doc ("Milk and dairy: Fridge temperatures") — confirm
the real requirements with the client before relying on the derived status.

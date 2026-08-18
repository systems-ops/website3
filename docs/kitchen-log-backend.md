# Kitchen Compliance Log

Digitizes paper food-safety forms FR-08-A, FR-08, FR-11, FR-47-A, FR-02 for
Passione Brands' kitchens, per the design handoff (`Kitchen Compliance Log
App` prototype + README). Backend (data model + API) and a working frontend
PWA both live in this repo.

## Stack

- **DB**: Postgres via Prisma ORM 7 (driver adapter: `@prisma/adapter-pg`).
  Deployed on Vercel Postgres; any Postgres works locally too (`DATABASE_URL`
  in `.env`). Started on SQLite during initial development, then switched
  once real deployment was in scope — SQLite has no persistent disk on
  Vercel's serverless functions, so it was never viable past local dev.
- **API**: Next.js Route Handlers under `src/app/api/`.
- **Frontend**: a client-rendered PWA at `/kitchen` (`src/app/kitchen/`), a
  separate Next.js root layout from the marketing site (see "Route
  structure" below) so it can be full-screen and installable independent of
  the restaurant pages.
- **Auth**: PIN-based cook sessions (`src/lib/pin.ts`, `src/lib/session.ts`)
  — a fast switch-user pattern for a shared kitchen tablet, not
  email/password. Session cookie, 12h TTL.

## Setup

```bash
npm install
# set DATABASE_URL in .env to a Postgres connection string (local or hosted)
npm run db:migrate   # applies prisma/migrations
npm run db:seed       # loads locations, forms, units/items, corrective actions, certificates, demo cooks
npm run dev
# then open http://localhost:3000/kitchen
```

Demo cook PINs (printed by `db:seed`): Jo=1234, Rosa=2345, Luca=3456, Ben=4567.

## Deployment (Vercel + Vercel Postgres)

Internal tool for kitchen tablets — nothing here needs to be public. The plan:

1. **Hosting**: Vercel project linked to this GitHub repo, deploying from
   `main`. Both the marketing site and `/kitchen` ship from the same
   deployment (they're one Next.js app).
2. **Database**: Vercel Postgres, attached to the project via the dashboard's
   **Storage** tab (Create Database → Postgres → Connect to Project). This is
   the one step Vercel doesn't expose over an API — do it once in the
   dashboard and it auto-injects the connection env vars into the project.
   Whatever the injected variable is named (check the Storage tab after
   connecting — usually `POSTGRES_URL` or `DATABASE_URL`), set the project's
   `DATABASE_URL` env var to that value if it isn't already named that.
3. Once `DATABASE_URL` is set on the Vercel project, run
   `npx prisma migrate deploy` against it (from a machine with that
   `DATABASE_URL`, e.g. `vercel env pull` then run locally) to create the
   schema, then `npx prisma db seed` to load the reference data.
4. **Access control**: cook accounts (PIN login) already gate actual use.
   On top of that, Vercel's **Password Protection** (Project Settings →
   Deployment Protection) adds a single shared password in front of the
   whole app with no code — enabled for this project. Deliberately not
   IP-restricted to a location's wifi: the design requires the app to keep
   working when kitchen wifi drops, so locking by network would fight that.
5. **Tablets**: open the URL in Safari/Chrome, "Add to Home Screen" — it's
   already a PWA (`public/kitchen-manifest.webmanifest`,
   `public/kitchen-sw.js`), so it installs and launches full-screen like a
   native app.

## Route structure

The marketing site (`about`, `contact`, `menu`, `order`, `reserve`, `gift-cards`,
the homepage) was moved under `src/app/(marketing)/` so it could keep its
own root layout (`SiteHeader`/`SiteFooter`) while `src/app/kitchen/layout.tsx`
defines an independent root layout for the kitchen app — Next.js's
[multiple root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout)
pattern via route groups. This is a pure reorganization; no marketing page
URLs changed.

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
| POST | `/api/log-entries` | Submit a new record (one per location/form/day) — requires a session |
| GET | `/api/log-entries/:id` | Single record with readings/checks/amendments |
| POST | `/api/log-entries/:id/amend` | Correct a signed record (creates a new row) — requires a session |
| GET | `/api/certificates?locationId=&days=30` | Derived certificate gap status |
| GET | `/api/auth/cooks?locationId=` | Cooks scoped to a kitchen (names only, for the PIN picker) |
| POST | `/api/auth/login` | `{ cookId, locationId, pin }` → sets session cookie |
| POST | `/api/auth/logout` | Clears session |
| GET | `/api/auth/me` | Current cook, or `{ cook: null }` |

`POST /api/log-entries` and the `/amend` endpoint enforce the same gating
rules as the design: every cell must be filled (temps) or every item ticked
(checklists), and any out-of-spec reading needs a corrective action before
the submission is accepted. `submittedBy`/`signatureName` are derived from
the session, not client input, and a cook must be scoped to a location
(`cook_locations`) to submit for it.

## Frontend (`src/app/kitchen/`)

- `KitchenApp.tsx` — top-level state: auth, selected location, tab
  (Today/Records), open entry flow, toast, offline/pending tracking.
- `LoginScreen.tsx` — kitchen picker → cook picker → PIN pad.
- `TodayTab.tsx` / `RecordsTab.tsx` / `EntryFlow.tsx` / `EntryDetail.tsx` —
  the four main screens from the design (Today, Records with certificates +
  month calendar, the entry flow with keypad and corrective-action gate, and
  a read-only view of an already-signed record).
- `offline.ts` — IndexedDB-backed draft persistence (so in-progress form
  state survives an app kill mid-shift) and an outbox of signed-but-not-yet-
  synced submissions. `KitchenApp` queues to the outbox on a network failure
  and flushes it on the browser's `online` event; entries are append-only so
  there's nothing to reconcile on reconnect.
- `kitchen-sw.js` (in `public/`) + `RegisterServiceWorker.tsx` — caches the
  app shell (JS/CSS/fonts) for installability and offline launch. It never
  caches `/api/*` — serving stale data offline for a compliance log would be
  actively misleading; the outbox above is what makes offline *submission*
  actually work.
- `strings.ts` — a small EN/ES dictionary for app chrome (buttons, labels,
  statuses). Log/unit/item names come from the database and aren't
  translated — scoped in per the design doc's note that the kitchens are
  bilingual, not meant as full i18n coverage.

## Known gaps (not built here)

Manager review, CSV/PDF export for auditors, photo attachment on corrective
actions, and the remaining ~13 paper forms (see the top-level project
conversation for what's known about those). The certificate requirements
seeded in `prisma/seed.ts` (which logs each of Organic/FDA/Milk and dairy/SQF
actually requires) are a placeholder inferred from the one example in the
design doc ("Milk and dairy: Fridge temperatures") — confirm the real
requirements with the client before relying on the derived status. Demo cook
PINs are seeded in plaintext in `prisma/seed.ts` for local development only —
replace with a real provisioning flow before any real deployment.

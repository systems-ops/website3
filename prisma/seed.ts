import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPin } from "../src/lib/pin";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mirrors LOGS / SITES / CERTS / CA in the design prototype
// (design_handoff_kitchen_log/Kitchen Log App v2.dc.html).

const SITES = ["Passione Emporio", "Hot Italian", "Passione Brands"];

const LOGS = [
  {
    id: "fridge",
    name: "Fridge temperatures",
    formCode: "Form FR-08-A (rev 4)",
    kind: "temps",
    unit: "F",
    slots: ["Morning", "Midday", "Afternoon"],
    units: [
      { name: "Walk-in fridge", low: 34, high: 40 },
      { name: "Dairy fridge", low: 34, high: 38 },
      { name: "Prep reach-in", low: 34, high: 40 },
    ],
  },
  {
    id: "freezer",
    name: "Freezer temperatures",
    formCode: "Form FR-08 (rev 3)",
    kind: "temps",
    unit: "F",
    slots: ["Morning", "Midday", "Afternoon"],
    units: [
      { name: "Walk-in freezer", low: -10, high: 5 },
      { name: "Ice cream freezer", low: -20, high: 0 },
    ],
  },
  {
    id: "truck",
    name: "Delivery truck coolers",
    formCode: "Form FR-11 (rev 1)",
    kind: "temps",
    unit: "C",
    slots: ["Before", "After"],
    units: [
      { name: "Cooler 1", low: 0, high: 4 },
      { name: "Cooler 2", low: 0, high: 4 },
    ],
  },
  {
    id: "clean",
    name: "Pre-production inspection",
    formCode: "Form FR-47-A",
    kind: "check",
    items: [
      "Floors are clean",
      "Trash recepticals are empty with clean bags",
      "All surfaces, tables, mixing bowls, scales, baking tins, white trays are clean",
      "All wood boards are free of debris and residue",
      "All utensils that will come in contact with raw product have been stored and maintained clean",
      "Dough mixer is clean",
      "Divider and rounder is clean",
      "Forming machine is cool and clean",
      "Saucing machine is clean and dry",
      "All secondary containers are labeled with Julian dates and lots: cheese, tomato sauce, semolina, malt, yeast, and flour",
      "Fridge temperatures have been checked and logged",
      "The employee break room is clean and organized",
      "All paperwork has been printed for batch records, tracking, receiving, and shopping",
      "Production schedule is updated, staff are aware of daily goals and requirements",
    ],
  },
  {
    id: "hygiene",
    name: "Hygiene inspection",
    formCode: "Form FR-65-A",
    kind: "check",
    items: [
      "Wash all surfaces",
      "Wash all tables",
      "Wash all mixing bowls",
      "Wash all scales",
      "Wash baking tins",
      "Wash white trays",
      "Wash metal baking racks",
      "Sanitize all utensils",
      "Clean dough mixer",
      "Clean dough divider",
      "Clean rounder",
      "Clean former",
      "Sweep floors",
      "Mop all floors",
      "Dispose of waste",
      "Clean production drains",
      "Clean employee break room",
      "Clean employee restroom",
    ],
  },
  {
    id: "exterior",
    name: "Exterior cleaning",
    formCode: "Form FR-66-A",
    kind: "check",
    items: [
      "Sweep doorways",
      "Remove trash from planter boxes and sidewalks",
      "Remove cobwebs from the doorways",
      "Wipe exterior glass on entrance doors",
      "Sweep exterior for cigarette butts and empty ashtrays",
      "Clean and sweep around the trash yard bins",
      "Use soapy water to remove obvious stains from the sidewalk",
      "Remove dust around doorways and ledges",
      "Clean and maintain loading and unloading areas",
      "Dispose of waste in correct bins",
    ],
  },
  {
    id: "restroom",
    name: "Restroom cleaning",
    formCode: "Form FR-60-A",
    kind: "check",
    items: [
      "Floor mopped",
      "Mirror cleaned",
      "Toilet paper stocked",
      "Paper towels stocked",
      "Toilet cleaned",
      "Sink cleaned",
      "Soap filled",
      "Walls wiped",
    ],
  },
  {
    id: "chlorine",
    name: "Chlorine solution testing",
    formCode: "Form FR-63-A",
    kind: "temps",
    unit: null,
    slots: ["Test"],
    units: [{ name: "Sanitizer solution", low: 90, high: 110, unitOverride: " PPM" }],
  },
  {
    id: "thermometer-calibration",
    name: "Thermometer calibration",
    formCode: "Form FR-51-A",
    kind: "calibration",
  },
  {
    id: "receiving-log",
    name: "Receiving log",
    formCode: "Form FR-40",
    kind: "receiving",
  },
  // Item 2 — restaurant food-safety checklist. Deliberately small: only the
  // handful of tasks where a failure is a food-safety problem, not a
  // presentation one (the rest is FOH sidework, item 4). One LogDefinition
  // covering all three shifts rather than three log kinds, per the spec's
  // explicit instruction — a checklist item's `shift` picks which shift it
  // belongs to. No existing paper form/FR-number for this.
  {
    id: "restaurant-shift-checklist",
    name: "Shift checklist",
    formCode: "Shift Checklist",
    kind: "check",
    items: [
      { label: "Sanitizer bucket prepared at server station, concentration verified", shift: "OPENING" },
      // Bathroom checks recur during the shift — this is the one item on
      // this form that's allowed to submit more than once per business
      // date, the same way Receiving already can.
      { label: "Bathroom check — customer", shift: "RUNNING" },
      { label: "Bathroom check — employee", shift: "RUNNING" },
      { label: "Sanitizer bucket refilled", shift: "RUNNING" },
      { label: "Sanitizer bucket emptied", shift: "CLOSING" },
      { label: "Tables and countertops wiped with sanitizer", shift: "CLOSING" },
      { label: "Gelato water well emptied and cleaned", shift: "CLOSING" },
      { label: "Gelato scoops and water well parts taken to dish area", shift: "CLOSING" },
    ],
  },
];

// Restaurant-only log kinds are seeded enabled at Hot Italian/Passione
// Emporio and disabled at Passione Brands — the inverse of
// RESTAURANT_ONLY_DISABLED below, which is manufacturing-only kinds
// disabled at the restaurants.
const MANUFACTURING_ONLY_DISABLED = new Set(["restaurant-shift-checklist"]);

const CORRECTIVE_ACTIONS: Record<string, string[]> = {
  fridge: [
    "Moved the food to the walk-in",
    "Turned the thermostat down",
    "Called for a repair",
    "Threw the food out",
  ],
  freezer: [
    "Moved the food to the walk-in freezer",
    "Reseated the door seal",
    "Called for a repair",
    "Threw the food out",
  ],
  truck: [
    "Turned the cooler down",
    "Added more ice packs",
    "Called maintenance",
    "Refused the delivery",
  ],
  chlorine: [
    "Added more sanitizer concentrate",
    "Diluted with more water",
    "Remade the solution",
    "Told the manager",
  ],
  // Fallback set (logDefinitionId = null), used by any log without its own presets.
  _: [
    "Fixed it on the spot",
    "Told the manager",
    "Held the food until someone checks it",
  ],
};

const CERTIFICATES = [
  {
    name: "Organic",
    requires: [{ logId: "receiving-log", frequency: "daily" }],
  },
  { name: "FDA", requires: [{ logId: "clean", frequency: "daily" }] },
  {
    name: "Milk and dairy",
    requires: [{ logId: "fridge", frequency: "daily" }],
  },
  {
    name: "SQF",
    requires: [
      { logId: "fridge", frequency: "daily" },
      { logId: "freezer", frequency: "daily" },
      { logId: "clean", frequency: "daily" },
      { logId: "hygiene", frequency: "daily" },
      { logId: "exterior", frequency: "daily" },
      { logId: "restroom", frequency: "daily" },
      { logId: "chlorine", frequency: "daily" },
      { logId: "thermometer-calibration", frequency: "daily" },
      { logId: "receiving-log", frequency: "daily" },
    ],
  },
];

// PINs are never hardcoded here — anyone with repo access would otherwise
// have live credentials. Seeding fails loudly if the env vars aren't set
// rather than silently falling back to a known default.
function requiredPin(envVar: string): string {
  const value = process.env[envVar];
  if (!value) {
    throw new Error(
      `Missing required env var ${envVar}. PINs are sourced from the environment, ` +
        `not this file — see .env.example for the full list, and README.md for how ` +
        `to generate and rotate them.`
    );
  }
  if (!/^\d{6,8}$/.test(value)) {
    throw new Error(`${envVar} must be 6-8 digits, got a value of length ${value.length}`);
  }
  return value;
}

// Shared PINs, not tied to a named person — anyone on shift uses whichever
// PIN they've been given. The PIN's label (not the digits) gets recorded as
// the signature on anything they submit, so records stay attributable
// without the app needing to know who's actually on staff at any time.
// Scoped to every location.
const COOKS = Array.from({ length: 10 }, (_, i) => ({
  name: `PIN ${i + 1}`,
  pin: requiredPin(`COOK_PIN_${i + 1}`),
}));

// Named individual accounts, distinct from the shared kitchen PIN pool —
// for the handful of forms that require a specific person's sign-off
// (e.g. CEO or SQF Practitioner approval) rather than "whoever's on shift".
const MANAGERS = [
  { name: "Fabrizio", role: "CEO", pin: requiredPin("MANAGER_PIN_FABRIZIO") },
  { name: "Tim", role: "Office Manager", pin: requiredPin("MANAGER_PIN_TIM") },
  { name: "Simar", role: "Assistant", pin: requiredPin("MANAGER_PIN_SIMAR") },
];

async function main() {
  for (const name of SITES) {
    await prisma.location.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const log of LOGS) {
    await prisma.logDefinition.upsert({
      where: { id: log.id },
      update: {
        name: log.name,
        formCode: log.formCode,
        kind: log.kind,
        unit: log.kind === "temps" ? log.unit : null,
        slots: log.kind === "temps" ? log.slots : undefined,
        active: true,
      },
      create: {
        id: log.id,
        name: log.name,
        formCode: log.formCode,
        kind: log.kind,
        unit: log.kind === "temps" ? log.unit : null,
        slots: log.kind === "temps" ? log.slots : undefined,
      },
    });

    if (log.kind === "temps" && log.units) {
      for (const [i, unit] of log.units.entries()) {
        const existing = await prisma.logUnit.findFirst({
          where: { logDefinitionId: log.id, name: unit.name },
        });
        const unitOverride: string | null =
          "unitOverride" in unit && typeof unit.unitOverride === "string" ? unit.unitOverride : null;
        if (existing) {
          await prisma.logUnit.update({
            where: { id: existing.id },
            data: { low: unit.low, high: unit.high, sortOrder: i, unitOverride },
          });
        } else {
          await prisma.logUnit.create({
            data: {
              logDefinitionId: log.id,
              name: unit.name,
              low: unit.low,
              high: unit.high,
              sortOrder: i,
              unitOverride,
            },
          });
        }
      }
    }

    if (log.kind === "check" && log.items) {
      for (const [i, item] of log.items.entries()) {
        // Most checklists just list plain labels (shift-agnostic — shift
        // stays null). The new restaurant shift checklist tags each item
        // with which shift it belongs to.
        const label = typeof item === "string" ? item : item.label;
        const shift = typeof item === "string" ? null : item.shift;
        const existing = await prisma.logItem.findFirst({
          where: { logDefinitionId: log.id, label },
        });
        if (existing) {
          await prisma.logItem.update({
            where: { id: existing.id },
            data: { sortOrder: i, shift },
          });
        } else {
          await prisma.logItem.create({
            data: { logDefinitionId: log.id, label, sortOrder: i, shift },
          });
        }
      }
    }
  }

  // "Deliveries received" (FR-02) is retired — folded into the Receiving
  // Log (FR-40, id "receiving-log") above, since both covered the same
  // event (a truck arriving). Kept in the database rather than deleted
  // (past submissions still reference it), just deactivated so it stops
  // showing up as a daily task, with its certificate requirement dropped.
  await prisma.logDefinition.updateMany({
    where: { id: "delivery" },
    data: { active: false },
  });
  await prisma.certificateRequirement.deleteMany({
    where: { logDefinitionId: "delivery" },
  });

  // Per-location form config (item 0): every log kind is enabled at every
  // location by default, so this is a no-op on top of existing behaviour —
  // except the item-1 decisions that are safe to make outright. Delivery
  // truck coolers don't apply to the restaurants (the arrival-temperature
  // check that matters to them already lives in the receiving log).
  // Chlorine/sanitizer testing and thermometer calibration were initially
  // left enabled everywhere pending written client confirmation before
  // disabling either — that confirmation came in explicitly, so both are
  // now disabled at the restaurants too, all three enabled only at
  // Passione Brands. Only `enabled` is decided here at create time —
  // re-running the seed does not stomp `enabled`/`displayLabel` on
  // existing rows, since those become manager-editable per-location
  // overrides once a config UI exists.
  const RESTAURANT_ONLY_DISABLED = new Set(["truck", "chlorine", "thermometer-calibration"]);
  const RESTAURANT_NAMES = new Set(["Hot Italian", "Passione Emporio"]);
  const locationsForConfig = await prisma.location.findMany();
  for (const loc of locationsForConfig) {
    for (const [i, log] of LOGS.entries()) {
      const isRestaurant = RESTAURANT_NAMES.has(loc.name);
      const enabled =
        !(RESTAURANT_ONLY_DISABLED.has(log.id) && isRestaurant) &&
        !(MANUFACTURING_ONLY_DISABLED.has(log.id) && !isRestaurant);
      await prisma.locationLogKind.upsert({
        where: { locationId_logDefinitionId: { locationId: loc.id, logDefinitionId: log.id } },
        update: { formReference: log.formCode, sortOrder: i },
        create: {
          locationId: loc.id,
          logDefinitionId: log.id,
          enabled,
          formReference: log.formCode,
          sortOrder: i,
        },
      });
    }
  }

  for (const [logId, texts] of Object.entries(CORRECTIVE_ACTIONS)) {
    const logDefinitionId = logId === "_" ? null : logId;
    const already = await prisma.correctiveActionOption.count({
      where: { logDefinitionId },
    });
    if (already > 0) continue;
    for (const [i, text] of texts.entries()) {
      await prisma.correctiveActionOption.create({
        data: { logDefinitionId, text, sortOrder: i },
      });
    }
  }

  for (const cert of CERTIFICATES) {
    const record = await prisma.certificate.upsert({
      where: { name: cert.name },
      update: {},
      create: { name: cert.name },
    });
    for (const req of cert.requires) {
      const existing = await prisma.certificateRequirement.findFirst({
        where: {
          certificateId: record.id,
          logDefinitionId: req.logId,
          locationId: null,
        },
      });
      if (existing) {
        await prisma.certificateRequirement.update({
          where: { id: existing.id },
          data: { frequency: req.frequency },
        });
      } else {
        await prisma.certificateRequirement.create({
          data: {
            certificateId: record.id,
            logDefinitionId: req.logId,
            frequency: req.frequency,
            locationId: null,
          },
        });
      }
    }
  }

  // Replace any earlier named demo accounts (Jo/Rosa/Luca/Ben) with the
  // generic PIN pool — safe to delete outright since submittedBy on past
  // log_entries is a plain audit string, not a foreign key.
  await prisma.cook.deleteMany({
    where: { id: { in: ["jo", "rosa", "luca", "ben"] } },
  });

  const allLocations = await prisma.location.findMany();
  for (const [i, c] of COOKS.entries()) {
    const id = `pin-${i + 1}`;
    const cook = await prisma.cook.upsert({
      where: { id },
      update: { pinHash: hashPin(c.pin) },
      create: { id, name: c.name, pinHash: hashPin(c.pin) },
    });
    for (const loc of allLocations) {
      await prisma.cookLocation.upsert({
        where: { cookId_locationId: { cookId: cook.id, locationId: loc.id } },
        update: {},
        create: { cookId: cook.id, locationId: loc.id },
      });
    }
  }

  for (const m of MANAGERS) {
    const existing = await prisma.manager.findFirst({ where: { name: m.name, role: m.role } });
    if (existing) {
      await prisma.manager.update({ where: { id: existing.id }, data: { pinHash: hashPin(m.pin) } });
    } else {
      await prisma.manager.create({ data: { name: m.name, role: m.role, pinHash: hashPin(m.pin) } });
    }
  }

  // PIN values never print by default — a production seed's console output
  // can end up in deploy logs that more people can see than should have
  // credentials. Opt in locally when you actually need to read them back.
  if (process.env.SEED_PRINT_PINS === "true") {
    console.log("PINs:", COOKS.map((c) => `${c.name}=${c.pin}`).join(", "));
    console.log("Manager PINs:", MANAGERS.map((m) => `${m.name} (${m.role})=${m.pin}`).join(", "));
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

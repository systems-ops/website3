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
];

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

// Item 4 — front-of-house sidework. Source: Passione server sidework and FOH
// closing checklists. Shared identically between Hot Italian and Passione
// Emporio per item 0's shared-SOP note (locationIds filled in per-restaurant
// in main(), once both location ids are known). No cash handling anywhere —
// client confirmed that's excluded entirely, and none of these touch it.
// `category` doubles as `role` (see the model comment) since the spec draws
// the role line at exactly this granularity.
const SIDEWORK_TASKS: { title: string; category: string; shift: "OPENING" | "RUNNING" | "CLOSING" | "DOWNTIME" }[] = [
  // OPENING — server
  { title: "Take down and straighten all chairs", category: "Server", shift: "OPENING" },
  { title: "Wipe down tables, barstools, barstool bases, countertops", category: "Server", shift: "OPENING" },
  { title: "Wipe down walls in front of bar and espresso bar", category: "Server", shift: "OPENING" },
  { title: "Check walls elsewhere, wipe as needed", category: "Server", shift: "OPENING" },
  { title: "Empty any water remnants from Prosecco table and wipe down", category: "Server", shift: "OPENING" },
  { title: "Restock and buff mise en place at expo station", category: "Server", shift: "OPENING" },
  { title: "Stock to-go containers at server station", category: "Server", shift: "OPENING" },
  { title: "Buff silverware and glassware", category: "Server", shift: "OPENING" },
  { title: "Rollups as needed", category: "Server", shift: "OPENING" },
  { title: "Fold wine serviettes and extra napkins", category: "Server", shift: "OPENING" },
  { title: "Check menus, discard any soiled or worn", category: "Server", shift: "OPENING" },
  { title: "Wipe condiments with a warm clean towel and place on tables", category: "Server", shift: "OPENING" },
  { title: "Fill waters and make ready for service", category: "Server", shift: "OPENING" },
  { title: "Final check: section buffed, clean, ready for guests", category: "Server", shift: "OPENING" },
  // RUNNING — server
  { title: "Rollups", category: "Server", shift: "RUNNING" },
  { title: "Keep server station stocked and clean", category: "Server", shift: "RUNNING" },
  // CLOSING — coffee and gelato station
  { title: "Wipe espresso machine inside and out, then turn off", category: "Coffee and gelato station", shift: "CLOSING" },
  { title: "Wipe down milk frothers", category: "Coffee and gelato station", shift: "CLOSING" },
  { title: "Fill coffee beans if needed", category: "Coffee and gelato station", shift: "CLOSING" },
  { title: "Empty coffee grounds from the day", category: "Coffee and gelato station", shift: "CLOSING" },
  { title: "Wipe gelato display window with glass cleaner", category: "Coffee and gelato station", shift: "CLOSING" },
  // CLOSING — stocking
  { title: "Waffle cones, gelato spoons, gelato cups", category: "Stocking", shift: "CLOSING" },
  { title: "Napkins, coffee cups, clear cups, straws", category: "Stocking", shift: "CLOSING" },
  { title: "Restock wine as needed", category: "Stocking", shift: "CLOSING" },
  { title: "Cups at all service stations", category: "Stocking", shift: "CLOSING" },
  { title: "Plates in the server station by the food pass-through", category: "Stocking", shift: "CLOSING" },
  { title: "Plates and cups at the back server station", category: "Stocking", shift: "CLOSING" },
  // CLOSING — beverage station
  { title: "Wipe down beverage counter", category: "Beverage station", shift: "CLOSING" },
  { title: "Place tap plugs on all beer taps", category: "Beverage station", shift: "CLOSING" },
  { title: "Empty ice from the wine service holder", category: "Beverage station", shift: "CLOSING" },
  { title: "Return wine bottles to the refrigerator", category: "Beverage station", shift: "CLOSING" },
  { title: "Fill water bottles, place in front refrigerator and retail refrigerator", category: "Beverage station", shift: "CLOSING" },
  // CLOSING — dining room
  { title: "Set all tables with plates, silverware, cups", category: "Dining room", shift: "CLOSING" },
  { title: "Turn off candles using the remote", category: "Dining room", shift: "CLOSING" },
  // CLOSING — server
  { title: "Collect condiment caddies, refill oils, leave at service station", category: "Server", shift: "CLOSING" },
  { title: "Clean serving trays", category: "Server", shift: "CLOSING" },
  { title: "Wipe down all tables and countertops", category: "Server", shift: "CLOSING" },
  { title: "75 rollups each", category: "Server", shift: "CLOSING" },
  { title: "Put up chairs and barstools", category: "Server", shift: "CLOSING" },
  { title: "Clean server station", category: "Server", shift: "CLOSING" },
  { title: "Clean expo station, pull plates and wipe underneath", category: "Server", shift: "CLOSING" },
  { title: "Empty and wash waters", category: "Server", shift: "CLOSING" },
  { title: "Return Orderman to manager", category: "Server", shift: "CLOSING" },
  // CLOSING — patio and exterior
  { title: "Close and lock all patio window doors", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Lower the patio shades", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Empty trash from the ice cream cone receptacle", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Bring in the ice cream cone display", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Bring in outside table and chairs", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Bring in all patio seat cushions", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Fold all patio umbrellas", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Bring the black patio table inside", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Return patio menus, silverware and plates inside", category: "Patio and exterior", shift: "CLOSING" },
  { title: "Sweep the patio", category: "Patio and exterior", shift: "CLOSING" },
  // CLOSING — final
  { title: "Bring all black serving trays to the dish area", category: "Final", shift: "CLOSING" },
  { title: "Restock beverages in the retail refrigerator", category: "Final", shift: "CLOSING" },
  { title: "Restock wine in the retail refrigerator", category: "Final", shift: "CLOSING" },
  { title: "Organize and return all menus to the server station", category: "Final", shift: "CLOSING" },
  { title: "Final walk-through: front of house clean, stocked, organized, ready to open", category: "Final", shift: "CLOSING" },
  // DOWNTIME — stocking
  { title: "Thermal paper for POS terminals, 3 at each station", category: "Stocking", shift: "DOWNTIME" },
  { title: "Pizza boxes, front and back stock", category: "Stocking", shift: "DOWNTIME" },
  { title: "Sugar caddies — raw, Splenda, white, straws; 3 each at server and expo", category: "Stocking", shift: "DOWNTIME" },
  { title: "Foil", category: "Stocking", shift: "DOWNTIME" },
  { title: "Menus", category: "Stocking", shift: "DOWNTIME" },
  { title: "Iced tea — 2 full bottles at the water station", category: "Stocking", shift: "DOWNTIME" },
  // DOWNTIME — cleaning and prep
  { title: "Fill condiment caddies: salt, pepper, rosemary oil, spicy oil", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Empty and wash salt and pepper shakers", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Wipe down table tents", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Wipe down patio tables, chairs, benches, umbrella bases, couch, pots", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Buff silverware and glassware", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Organize back server station near the dish pit", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Organize front server station at the gelato bar", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Stamp to-go boxes", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Stamp to-go coffee cups", category: "Cleaning and prep", shift: "DOWNTIME" },
  { title: "Run food and assist other servers", category: "Cleaning and prep", shift: "DOWNTIME" },
];

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
      for (const [i, label] of log.items.entries()) {
        const existing = await prisma.logItem.findFirst({
          where: { logDefinitionId: log.id, label },
        });
        if (existing) {
          await prisma.logItem.update({
            where: { id: existing.id },
            data: { sortOrder: i },
          });
        } else {
          await prisma.logItem.create({
            data: { logDefinitionId: log.id, label, sortOrder: i },
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
      const enabled = !(RESTAURANT_ONLY_DISABLED.has(log.id) && RESTAURANT_NAMES.has(loc.name));
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

  // Item 4 — front-of-house sidework, seeded identically at the two
  // restaurants (shared SOPs, per item 0) via one row's locationIds
  // covering both, rather than duplicating rows that then drift. Not
  // seeded at Passione Brands at all — this is a restaurant-only feature.
  // Matched by (title, shift) rather than an id, same idempotent-seed
  // pattern as LogItem, since SideworkTask has no natural business key.
  const restaurantLocationIds = locationsForConfig
    .filter((loc) => RESTAURANT_NAMES.has(loc.name))
    .map((loc) => loc.id);
  for (const [i, task] of SIDEWORK_TASKS.entries()) {
    const existing = await prisma.sideworkTask.findFirst({
      where: { title: task.title, shift: task.shift },
    });
    if (existing) {
      await prisma.sideworkTask.update({
        where: { id: existing.id },
        data: { category: task.category, role: task.category, sortOrder: i, locationIds: restaurantLocationIds },
      });
    } else {
      await prisma.sideworkTask.create({
        data: {
          title: task.title,
          category: task.category,
          role: task.category,
          shift: task.shift,
          locationIds: restaurantLocationIds,
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

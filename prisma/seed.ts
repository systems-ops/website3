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
    id: "delivery",
    name: "Deliveries received",
    formCode: "Form FR-02 (rev 3)",
    kind: "check",
    items: [
      "Truck temperature written down",
      "Seal intact and matches the paperwork",
      "Case count matches the invoice",
      "Supplier paperwork attached",
      "Organic certificate still current",
      "Lot codes written down",
    ],
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
  // Fallback set (logDefinitionId = null), used by any log without its own presets.
  _: [
    "Fixed it on the spot",
    "Told the manager",
    "Held the food until someone checks it",
  ],
};

const CERTIFICATES = [
  { name: "Organic", requires: [{ logId: "delivery", frequency: "daily" }] },
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
    ],
  },
];

// Demo cooks + PINs (matches NAMES in the prototype). Scoped to every
// location for demo purposes — a real rollout would scope each cook to the
// kitchen(s) they actually work at.
const COOKS = [
  { name: "Jo", pin: "1234" },
  { name: "Rosa", pin: "2345" },
  { name: "Luca", pin: "3456" },
  { name: "Ben", pin: "4567" },
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
        if (existing) {
          await prisma.logUnit.update({
            where: { id: existing.id },
            data: { low: unit.low, high: unit.high, sortOrder: i },
          });
        } else {
          await prisma.logUnit.create({
            data: {
              logDefinitionId: log.id,
              name: unit.name,
              low: unit.low,
              high: unit.high,
              sortOrder: i,
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

  const allLocations = await prisma.location.findMany();
  for (const c of COOKS) {
    const cook = await prisma.cook.upsert({
      where: { id: c.name.toLowerCase() },
      update: {},
      create: { id: c.name.toLowerCase(), name: c.name, pinHash: hashPin(c.pin) },
    });
    for (const loc of allLocations) {
      await prisma.cookLocation.upsert({
        where: { cookId_locationId: { cookId: cook.id, locationId: loc.id } },
        update: {},
        create: { cookId: cook.id, locationId: loc.id },
      });
    }
  }
  console.log("Demo cook PINs:", COOKS.map((c) => `${c.name}=${c.pin}`).join(", "));

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

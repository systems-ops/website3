import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getEnabledLogDefinitions } from "@/lib/location-log-kinds";
import { mondayOf, recentWeekStarts } from "@/lib/verification";

// A one-off tool for previewing what exports look like with real-shaped
// history in them — not part of the app's normal operation. Every row this
// writes is tagged so it can be found and removed as a unit:
// LogEntry.submittedBy is fixed to DEMO_MARKER (a plain audit string, not an
// FK — see LogEntry.submittedBy's own comment), and Verification/
// ReceivingReview, which don't have a free-text audit field to (ab)use the
// same way, get a distinctive prefix on `comments` instead.
export const DEMO_MARKER = "demo-seed";
const DEMO_SIGNATURE = "Demo Data (seed)";
const DEMO_COMMENT_PREFIX = "[DEMO DATA]";

function weekDates(weekStart: string): string[] {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setUTCDate(start.getUTCDate() + i);
    return dt.toISOString().slice(0, 10);
  });
}

function pacificInstant(businessDate: string, hour: number, minute = 0): Date {
  // A fixed -07:00 offset is close enough for demo timestamps — nobody
  // audits exact submission times on synthetic data, and the businessDate
  // string (the field everything else keys off) is set explicitly anyway.
  return new Date(`${businessDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-07:00`);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(p: number): boolean {
  return Math.random() < p;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const CORRECTIVE_ACTIONS = [
  "Adjusted and re-checked",
  "Reported to manager on shift",
  "Corrected before service",
  "Logged and flagged for follow-up",
];

const NA_REASONS = ["Not applicable today", "No deliveries this shift", "Station closed"];

const DISTRIBUTORS = ["Golden State Foods", "Bay Produce Co.", "Dairy Fresh Distributors", "Sierra Meats & Provisions"];
const PRODUCTS = [
  "00 Flour (50lb)",
  "Fresh Mozzarella",
  "San Marzano Tomatoes",
  "Semolina Flour",
  "Cultured Butter",
  "Organic Basil",
  "Prosciutto di Parma",
  "Arborio Rice",
];
const STORAGE_TYPES: ("dry" | "refrig" | "freezer")[] = ["dry", "refrig", "freezer"];

type DefWithChildren = Prisma.LogDefinitionGetPayload<{ include: { units: true; items: { where: { active: true } } } }>;

function buildReadings(def: DefWithChildren): Prisma.ReadingCreateWithoutLogEntryInput[] {
  const slots = Array.isArray(def.slots) ? (def.slots as string[]) : [];
  const created: Prisma.ReadingCreateWithoutLogEntryInput[] = [];
  for (const unit of def.units) {
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      const outOfSpec = chance(0.08);
      const value = outOfSpec
        ? chance(0.5)
          ? round1(unit.low - (1 + Math.random() * 2))
          : round1(unit.high + (1 + Math.random() * 2))
        : round1(unit.low + Math.random() * (unit.high - unit.low));
      created.push({
        logUnit: { connect: { id: unit.id } },
        slotIndex,
        value,
        outOfSpec,
        specLow: unit.low,
        specHigh: unit.high,
        specUnitOverride: unit.unitOverride,
        correctiveAction: outOfSpec ? pick(CORRECTIVE_ACTIONS) : null,
      });
    }
  }
  return created;
}

function buildItemChecks(items: DefWithChildren["items"], shift: string | null): Prisma.ItemCheckCreateWithoutLogEntryInput[] {
  const applicable = items.filter((i) => i.shift === null || i.shift === shift);
  return applicable.map((item) => {
    const roll = Math.random();
    if (roll < 0.92) return { logItem: { connect: { id: item.id } }, status: "PASS", statusNote: null };
    if (roll < 0.97) {
      return { logItem: { connect: { id: item.id } }, status: "FAIL", statusNote: pick(CORRECTIVE_ACTIONS) };
    }
    return { logItem: { connect: { id: item.id } }, status: "NA", statusNote: pick(NA_REASONS) };
  });
}

function buildCalibrationRows(): Prisma.CalibrationRowCreateWithoutLogEntryInput[] {
  const count = 2 + Math.floor(Math.random() * 2);
  return Array.from({ length: count }, (_, i) => {
    const referenceReading = round1(32 + Math.random() * 2);
    const drift = chance(0.1) ? 2.5 + Math.random() * 1.5 : Math.random() * 1.8;
    const testReading = round1(chance(0.5) ? referenceReading + drift : referenceReading - drift);
    const adjustmentRequired = Math.abs(referenceReading - testReading) > 2;
    return {
      rowIndex: i,
      testTermId: `Thermometer #${i + 1}`,
      referenceReading,
      testReading,
      adjustmentRequired,
      comments: adjustmentRequired ? "Recalibrated against reference" : null,
    };
  });
}

function buildReceiving(): Prisma.ReceivingDetailCreateWithoutLogEntryInput {
  const lineCount = 1 + Math.floor(Math.random() * 3);
  return {
    invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 89999)}`,
    distributorName: pick(DISTRIBUTORS),
    wfcfoApproved: true,
    nonGmoApproved: true,
    truckConditionGood: true,
    truckTempCompliant: true,
    truckTempF: round1(34 + Math.random() * 4),
    palletConditionGood: true,
    plasticWrapGood: true,
    productsToStandard: true,
    labelsCurrent: true,
    sealIntact: true,
    caseCountMatches: true,
    supplierPaperworkAttached: true,
    organicCertCurrent: true,
    lines: {
      create: Array.from({ length: lineCount }, (_, i) => ({
        rowIndex: i,
        productName: pick(PRODUCTS),
        productCount: String(1 + Math.floor(Math.random() * 12)),
        lotNumber: `L${Math.floor(1000 + Math.random() * 8999)}`,
        allergenProduct: chance(0.2),
        labeledOrganic: chance(0.3),
        storageType: pick(STORAGE_TYPES),
      })),
    },
  };
}

export type SeedDemoHistoryResult = {
  locations: number;
  logEntries: number;
  verifications: number;
  receivingReviews: number;
};

export async function seedDemoHistory(): Promise<SeedDemoHistoryResult> {
  const weeks = recentWeekStarts(6).slice(1); // 5 most recently completed weeks, current partial week excluded
  const locations = await prisma.location.findMany();
  const manager = await prisma.manager.findFirst({ where: { active: true }, orderBy: { name: "asc" } });
  if (!manager) throw new Error("No active manager found to attribute weekly sign-offs to");

  let logEntries = 0;
  let verifications = 0;
  let receivingReviews = 0;

  for (const location of locations) {
    const defs = await getEnabledLogDefinitions(location.id);
    const defsWithChildren = new Map<string, DefWithChildren>();
    for (const def of defs) {
      if (def.kind === "temps" || def.kind === "check") {
        const full = (await prisma.logDefinition.findUnique({
          where: { id: def.id },
          include: { units: true, items: { where: { active: true } } },
        })) as DefWithChildren;
        defsWithChildren.set(def.id, full);
      }
    }

    const hasShiftChecklist = defs.some((d) => d.id === "restaurant-shift-checklist");
    const hasReceiving = defs.some((d) => d.id === "receiving-log");

    for (let wi = 0; wi < weeks.length; wi++) {
      const days = weekDates(weeks[wi]);
      for (const businessDate of days) {
        for (const def of defs) {
          if (def.id === "restaurant-shift-checklist" || def.id === "receiving-log") continue;

          if (def.kind === "temps") {
            const full = defsWithChildren.get(def.id)!;
            await prisma.logEntry.create({
              data: {
                location: { connect: { id: location.id } },
                logDefinition: { connect: { id: def.id } },
                businessDate,
                shift: "ALL_DAY",
                submittedAt: pacificInstant(businessDate, 8),
                submittedBy: DEMO_MARKER,
                signatureName: DEMO_SIGNATURE,
                readings: { create: buildReadings(full) },
              },
            });
            logEntries++;
          } else if (def.kind === "check") {
            const full = defsWithChildren.get(def.id)!;
            await prisma.logEntry.create({
              data: {
                location: { connect: { id: location.id } },
                logDefinition: { connect: { id: def.id } },
                businessDate,
                shift: "ALL_DAY",
                submittedAt: pacificInstant(businessDate, 21),
                submittedBy: DEMO_MARKER,
                signatureName: DEMO_SIGNATURE,
                itemChecks: { create: buildItemChecks(full.items, null) },
              },
            });
            logEntries++;
          } else if (def.kind === "calibration") {
            await prisma.logEntry.create({
              data: {
                location: { connect: { id: location.id } },
                logDefinition: { connect: { id: def.id } },
                businessDate,
                shift: "ALL_DAY",
                submittedAt: pacificInstant(businessDate, 10),
                submittedBy: DEMO_MARKER,
                signatureName: DEMO_SIGNATURE,
                calibrationRows: { create: buildCalibrationRows() },
              },
            });
            logEntries++;
          }
        }

        if (hasShiftChecklist) {
          const full = (await prisma.logDefinition.findUnique({
            where: { id: "restaurant-shift-checklist" },
            include: { units: true, items: { where: { active: true } } },
          })) as DefWithChildren;

          const shiftPlan: { shift: string; hour: number }[] = [
            { shift: "OPENING", hour: 9 },
            { shift: "RUNNING", hour: 13 },
            { shift: "RUNNING", hour: 16 },
            { shift: "CLOSING", hour: 22 },
          ];
          for (const { shift, hour } of shiftPlan) {
            await prisma.logEntry.create({
              data: {
                location: { connect: { id: location.id } },
                logDefinition: { connect: { id: "restaurant-shift-checklist" } },
                businessDate,
                shift,
                submittedAt: pacificInstant(businessDate, hour),
                submittedBy: DEMO_MARKER,
                signatureName: DEMO_SIGNATURE,
                itemChecks: { create: buildItemChecks(full.items, shift) },
              },
            });
            logEntries++;
          }
        }

        if (hasReceiving && chance(0.45)) {
          await prisma.logEntry.create({
            data: {
              location: { connect: { id: location.id } },
              logDefinition: { connect: { id: "receiving-log" } },
              businessDate,
              shift: "ALL_DAY",
              submittedAt: pacificInstant(businessDate, 12),
              submittedBy: DEMO_MARKER,
              signatureName: DEMO_SIGNATURE,
              receivingDetail: { create: buildReceiving() },
            },
          });
          logEntries++;
        }
      }

      // Review receiving deliveries and sign off the week — except the most
      // recently completed week, left open so the exports also show what
      // "needs review" / "unverified" looks like, not just a clean slate.
      const isMostRecentCompletedWeek = wi === 0;
      if (!isMostRecentCompletedWeek) {
        const receivingEntries = await prisma.logEntry.findMany({
          where: {
            locationId: location.id,
            logDefinitionId: "receiving-log",
            businessDate: { in: days },
            submittedBy: DEMO_MARKER,
            receivingReview: null,
          },
        });
        for (const entry of receivingEntries) {
          await prisma.receivingReview.create({
            data: {
              logEntry: { connect: { id: entry.id } },
              manager: { connect: { id: manager.id } },
              approved: true,
              releasedForUse: true,
              comments: `${DEMO_COMMENT_PREFIX} Reviewed on receipt.`,
            },
          });
          receivingReviews++;
        }

        await prisma.verification.create({
          data: {
            location: { connect: { id: location.id } },
            weekStart: mondayOf(weeks[wi]),
            manager: { connect: { id: manager.id } },
            verifiedAt: pacificInstant(days[6], 20),
            comments: `${DEMO_COMMENT_PREFIX} Weekly review completed.`,
          },
        });
        verifications++;
      }
    }
  }

  return { locations: locations.length, logEntries, verifications, receivingReviews };
}

export async function deleteDemoHistory(): Promise<{ logEntries: number; verifications: number }> {
  const demoEntries = await prisma.logEntry.findMany({
    where: { submittedBy: DEMO_MARKER },
    select: { id: true },
  });
  const ids = demoEntries.map((e) => e.id);

  const [, , , , , , deletedEntries, deletedVerifications] = await prisma.$transaction([
    prisma.receivingLine.deleteMany({ where: { receivingDetail: { logEntryId: { in: ids } } } }),
    prisma.receivingReview.deleteMany({ where: { logEntryId: { in: ids } } }),
    prisma.receivingDetail.deleteMany({ where: { logEntryId: { in: ids } } }),
    prisma.reading.deleteMany({ where: { logEntryId: { in: ids } } }),
    prisma.itemCheck.deleteMany({ where: { logEntryId: { in: ids } } }),
    prisma.calibrationRow.deleteMany({ where: { logEntryId: { in: ids } } }),
    prisma.logEntry.deleteMany({ where: { id: { in: ids } } }),
    prisma.verification.deleteMany({ where: { comments: { startsWith: DEMO_COMMENT_PREFIX } } }),
  ]);

  return { logEntries: deletedEntries.count, verifications: deletedVerifications.count };
}

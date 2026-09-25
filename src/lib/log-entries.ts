import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-errors";
import type { CreateLogEntryInput } from "@/lib/log-entry-schemas";

type LogDefinitionWithChildren = Prisma.LogDefinitionGetPayload<{
  include: { units: true; items: true };
}>;

// Validates a submission against its form definition and builds the nested
// Prisma create payload (readings with a snapshotted spec range, or item
// checks). Shared by fresh submissions and amendments — both go through the
// same gating rules from the design: every cell filled / every item ticked,
// and every out-of-spec reading answered.
type LogEntryChildData = {
  readings?: Prisma.ReadingCreateWithoutLogEntryInput[];
  itemChecks?: Prisma.ItemCheckCreateWithoutLogEntryInput[];
  calibrationRows?: Prisma.CalibrationRowCreateWithoutLogEntryInput[];
  receivingDetail?: Prisma.ReceivingDetailCreateWithoutLogEntryInput;
};

// Thermometers are calibrated against a reference thermometer and must read
// within +/- 2°F of it (per the paper FR-51-A form's own footer note).
const CALIBRATION_TOLERANCE = 2;

// Log kinds whose LogItems are tagged by shift (see LogItem.shift) — the
// only one today is the restaurant opening/running/closing checklist.
// `shift` is only meaningful, and only required on submission, for these.
export const SHIFT_AWARE_LOG_IDS = new Set(["restaurant-shift-checklist"]);

// Within a shift-aware log kind, which shift(s) may submit more than once
// per business date — bathroom checks recur through the running shift, the
// same way Receiving already can submit more than once a day. Opening and
// closing stay one-submission-per-shift-per-day.
const REPEATABLE_SHIFTS: Record<string, Set<string>> = {
  "restaurant-shift-checklist": new Set(["RUNNING"]),
};

export function isRepeatableSubmission(logDefinitionId: string, kind: string, shift: string): boolean {
  if (kind === "receiving") return true;
  return REPEATABLE_SHIFTS[logDefinitionId]?.has(shift) ?? false;
}

export async function buildLogEntryCreateData(
  input: Omit<CreateLogEntryInput, "locationId" | "logDefinitionId" | "businessDate">,
  logDefinitionId: string,
  shift: string
): Promise<LogEntryChildData> {
  const definition = (await prisma.logDefinition.findUnique({
    where: { id: logDefinitionId },
    include: { units: true, items: { where: { active: true } } },
  })) as LogDefinitionWithChildren | null;

  if (!definition) throw new ApiError(404, "Log definition not found");
  if (!definition.active) throw new ApiError(400, "Log definition is not active");

  if (definition.kind === "temps") {
    return buildTempsData(definition, input.readings ?? []);
  }
  if (definition.kind === "check") {
    return buildCheckData(definition, input.itemChecks ?? [], shift);
  }
  if (definition.kind === "calibration") {
    return buildCalibrationData(input.calibrationRows ?? []);
  }
  if (definition.kind === "receiving") {
    if (!input.receiving) throw new ApiError(400, "Receiving details are required");
    return buildReceivingData(input.receiving);
  }
  throw new ApiError(500, `Unknown log kind: ${definition.kind}`);
}

function buildReceivingData(receiving: NonNullable<CreateLogEntryInput["receiving"]>) {
  const detail: Prisma.ReceivingDetailCreateWithoutLogEntryInput = {
    invoiceNumber: receiving.invoiceNumber,
    distributorName: receiving.distributorName,
    wfcfoApproved: receiving.wfcfo.approved,
    wfcfoExplain: receiving.wfcfo.explain ?? null,
    nonGmoApproved: receiving.nonGmo.approved,
    nonGmoExplain: receiving.nonGmo.explain ?? null,
    truckConditionGood: receiving.truckCondition.approved,
    truckConditionExplain: receiving.truckCondition.explain ?? null,
    truckTempCompliant: receiving.truckTempCompliant,
    truckTempF: receiving.truckTempF ?? null,
    palletConditionGood: receiving.palletConditionGood,
    plasticWrapGood: receiving.plasticWrapGood,
    productsToStandard: receiving.productsToStandard.approved,
    productsToStandardExplain: receiving.productsToStandard.explain ?? null,
    labelsCurrent: receiving.labelsCurrent.approved,
    labelsCurrentExplain: receiving.labelsCurrent.explain ?? null,
    sealIntact: receiving.sealIntact,
    caseCountMatches: receiving.caseCountMatches,
    supplierPaperworkAttached: receiving.supplierPaperworkAttached,
    organicCertCurrent: receiving.organicCertCurrent,
    lines: {
      create: receiving.lines.map((line, i) => ({
        rowIndex: i,
        productName: line.productName,
        productId: line.productId ?? null,
        productCount: line.productCount ?? null,
        lotNumber: line.lotNumber ?? null,
        allergenProduct: line.allergenProduct,
        labeledOrganic: line.labeledOrganic,
        storageType: line.storageType,
      })),
    },
  };

  return { receivingDetail: detail };
}

function buildCalibrationData(rows: NonNullable<CreateLogEntryInput["calibrationRows"]>) {
  if (rows.length === 0) {
    throw new ApiError(400, "At least one thermometer reading is required");
  }

  const created: Prisma.CalibrationRowCreateWithoutLogEntryInput[] = rows.map((r, i) => {
    const adjustmentRequired = Math.abs(r.referenceReading - r.testReading) > CALIBRATION_TOLERANCE;
    if (adjustmentRequired && !r.comments) {
      throw new ApiError(
        400,
        `Thermometer "${r.testTermId}" is more than ${CALIBRATION_TOLERANCE}° off reference and needs a comment`
      );
    }
    return {
      rowIndex: i,
      testTermId: r.testTermId,
      referenceReading: r.referenceReading,
      testReading: r.testReading,
      adjustmentRequired,
      comments: r.comments ?? null,
    };
  });

  return { calibrationRows: created };
}

function buildTempsData(
  definition: LogDefinitionWithChildren,
  readings: NonNullable<CreateLogEntryInput["readings"]>
) {
  const slots = Array.isArray(definition.slots) ? (definition.slots as string[]) : [];
  const unitsById = new Map(definition.units.map((u) => [u.id, u]));
  const expectedCells = definition.units.length * slots.length;

  if (readings.length !== expectedCells) {
    throw new ApiError(
      400,
      `Expected ${expectedCells} readings (${definition.units.length} units x ${slots.length} slots), got ${readings.length}`
    );
  }

  const seen = new Set<string>();
  const created: Prisma.ReadingCreateWithoutLogEntryInput[] = [];

  for (const r of readings) {
    const unit = unitsById.get(r.logUnitId);
    if (!unit) {
      throw new ApiError(400, `Unknown logUnitId ${r.logUnitId} for this form`);
    }
    if (r.slotIndex < 0 || r.slotIndex >= slots.length) {
      throw new ApiError(400, `slotIndex ${r.slotIndex} is out of range for this form`);
    }
    const key = `${r.logUnitId}:${r.slotIndex}`;
    if (seen.has(key)) {
      throw new ApiError(400, `Duplicate reading for unit ${r.logUnitId} slot ${r.slotIndex}`);
    }
    seen.add(key);

    const outOfSpec = r.value < unit.low || r.value > unit.high;
    if (outOfSpec && !r.correctiveAction) {
      throw new ApiError(
        400,
        `Reading for "${unit.name}" (slot ${slots[r.slotIndex]}) is out of spec and needs a corrective action`
      );
    }

    created.push({
      logUnit: { connect: { id: unit.id } },
      slotIndex: r.slotIndex,
      value: r.value,
      outOfSpec,
      specLow: unit.low,
      specHigh: unit.high,
      specUnitOverride: unit.unitOverride,
      correctiveAction: r.correctiveAction ?? null,
    });
  }

  return { readings: created };
}

function buildCheckData(
  definition: LogDefinitionWithChildren,
  itemChecks: NonNullable<CreateLogEntryInput["itemChecks"]>,
  shift: string
) {
  // A shift-aware checklist (see LogItem.shift) presents a different item
  // list per shift from a single LogDefinition, rather than three separate
  // log kinds standing in for one form. An item with no shift set applies
  // regardless, which is every existing checklist's item — this filter is a
  // no-op for them.
  const applicableItems = definition.items.filter((i) => i.shift === null || i.shift === shift);
  const itemIds = new Set(applicableItems.map((i) => i.id));
  if (itemChecks.length !== applicableItems.length) {
    throw new ApiError(
      400,
      `Expected ${applicableItems.length} checklist entries, got ${itemChecks.length}`
    );
  }

  const seen = new Set<string>();
  const created: Prisma.ItemCheckCreateWithoutLogEntryInput[] = [];

  // A checklist must always be able to submit with a FAIL present — a
  // form that can only ever record 100% pass is unable to tell the truth.
  // FAIL and NA each require a note (corrective action, or reason it
  // doesn't apply); that requirement is enforced by itemCheckInputSchema
  // itself, not repeated here.
  for (const c of itemChecks) {
    if (!itemIds.has(c.logItemId)) {
      throw new ApiError(400, `Unknown logItemId ${c.logItemId} for this form`);
    }
    if (seen.has(c.logItemId)) {
      throw new ApiError(400, `Duplicate check for item ${c.logItemId}`);
    }
    seen.add(c.logItemId);
    created.push({
      logItem: { connect: { id: c.logItemId } },
      status: c.status,
      statusNote: c.statusNote ?? null,
    });
  }

  return { itemChecks: created };
}

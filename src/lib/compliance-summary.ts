import { prisma } from "@/lib/prisma";
import { businessDateOf } from "@/lib/business-date";
import { getEnabledLogDefinitions } from "@/lib/location-log-kinds";

// The aggregation shared by the weekly verification view (src/lib/
// verification.ts) and the end-of-day manager report (item 3). Per the
// spec: reuse this rather than write a second implementation that drifts
// from the first — a weekly window and a single-day window are both just
// a list of business dates to this function.
export type OutOfSpecItem = {
  businessDate: string;
  formCode: string;
  formName: string;
  item: string;
  value: string;
  correctiveAction: string | null;
  signedBy: string;
};

export type FailedItem = {
  businessDate: string;
  formCode: string;
  formName: string;
  item: string;
  note: string | null;
  signedBy: string;
};

export type LateItem = {
  businessDate: string;
  formCode: string;
  formName: string;
  signedBy: string;
  lateReason: string;
};

export type AmendmentItem = {
  businessDate: string;
  formCode: string;
  formName: string;
  signedBy: string;
  amendReason: string;
};

export type RejectedReceivingItem = {
  businessDate: string;
  signedBy: string;
  reason: string | null;
};

export type MissingByLog = { logDefinitionId: string; name: string; daysMissing: string[] };

export type ComplianceSummary = {
  days: string[];
  missingByLog: MissingByLog[];
  outOfSpec: OutOfSpecItem[];
  failed: FailedItem[];
  late: LateItem[];
  amendments: AmendmentItem[];
  rejectedReceiving: RejectedReceivingItem[];
};

export async function computeComplianceSummary(
  locationId: string,
  days: string[],
  today: string
): Promise<ComplianceSummary> {
  const [definitions, entries] = await Promise.all([
    getEnabledLogDefinitions(locationId),
    prisma.logEntry.findMany({
      where: { locationId, businessDate: { in: days }, amendsId: null },
      include: {
        readings: { include: { logUnit: true } },
        itemChecks: { include: { logItem: true } },
        receivingReview: true,
        logDefinition: true,
      },
    }),
  ]);

  const presentByLog = new Map<string, Set<string>>();
  for (const e of entries) {
    if (!presentByLog.has(e.logDefinitionId)) presentByLog.set(e.logDefinitionId, new Set());
    presentByLog.get(e.logDefinitionId)!.add(e.businessDate);
  }

  const missingByLog: MissingByLog[] = definitions
    // Receiving is multiple-per-day (or zero) — "missing" doesn't mean
    // anything for it the way it does for a daily sweep.
    .filter((d) => d.kind !== "receiving")
    .map((d) => {
      const present = presentByLog.get(d.id) ?? new Set();
      return {
        logDefinitionId: d.id,
        name: d.name,
        daysMissing: days.filter((day) => day <= today && !present.has(day)),
      };
    })
    .filter((d) => d.daysMissing.length > 0);

  const outOfSpec: OutOfSpecItem[] = [];
  const failed: FailedItem[] = [];
  const late: LateItem[] = [];
  const rejectedReceiving: RejectedReceivingItem[] = [];

  for (const e of entries) {
    const formCode = e.logDefinition.formCode;
    const formName = e.logDefinition.name;
    for (const r of e.readings) {
      if (r.outOfSpec) {
        outOfSpec.push({
          businessDate: e.businessDate,
          formCode,
          formName,
          item: r.logUnit.name,
          value: `${r.value}${r.specUnitOverride ?? ""}`,
          correctiveAction: r.correctiveAction,
          signedBy: e.signatureName,
        });
      }
    }
    for (const c of e.itemChecks) {
      if (c.status === "FAIL") {
        failed.push({
          businessDate: e.businessDate,
          formCode,
          formName,
          item: c.logItem.label,
          note: c.statusNote,
          signedBy: e.signatureName,
        });
      }
    }
    if (e.enteredLate) {
      late.push({ businessDate: e.businessDate, formCode, formName, signedBy: e.signatureName, lateReason: e.lateReason ?? "" });
    }
    if (
      e.logDefinition.kind === "receiving" &&
      e.receivingReview &&
      (!e.receivingReview.approved || !e.receivingReview.releasedForUse)
    ) {
      rejectedReceiving.push({ businessDate: e.businessDate, signedBy: e.signatureName, reason: e.receivingReview.rejectedReason });
    }
  }

  // Amendments are their own rows (amendsId set), excluded from `entries`
  // above by design (an amendment's businessDate is inherited from the
  // original it corrects, not the day it was actually submitted, so it
  // can't be found by the same businessDate-in-days query). "Amendments
  // made that day" means submitted that day, so this is a separate query
  // widened by a few days around the window and then filtered precisely by
  // the Pacific calendar date of submittedAt.
  const first = days[0];
  const last = days[days.length - 1];
  const widenedFrom = shiftDate(first, -3);
  const widenedTo = shiftDate(last, 3);
  const amendmentCandidates = await prisma.logEntry.findMany({
    where: {
      locationId,
      amendsId: { not: null },
      businessDate: { gte: widenedFrom, lte: widenedTo },
    },
    include: { logDefinition: true },
  });
  const daySet = new Set(days);
  const amendments: AmendmentItem[] = amendmentCandidates
    .filter((a) => daySet.has(businessDateOf(a.submittedAt)))
    .map((a) => ({
      businessDate: businessDateOf(a.submittedAt),
      formCode: a.logDefinition.formCode,
      formName: a.logDefinition.name,
      signedBy: a.signatureName,
      amendReason: a.amendReason ?? "",
    }));

  return { days, missingByLog, outOfSpec, failed, late, amendments, rejectedReceiving };
}

function shiftDate(dateStr: string, days: number): string {
  const dt = new Date(`${dateStr}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

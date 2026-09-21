import { prisma } from "@/lib/prisma";
import { businessDateOf } from "@/lib/business-date";
import { computeComplianceSummary, type ComplianceSummary } from "@/lib/compliance-summary";
import { getEnabledLogDefinitions } from "@/lib/location-log-kinds";

export type LowStockFlagItem = {
  productName: string;
  raisedSignatureName: string;
  raiseCount: number;
  note: string | null;
};

export type DailyReportData = {
  location: { id: string; name: string };
  businessDate: string;
  expectedCount: number;
  completedCount: number;
  outstanding: { logDefinitionId: string; name: string }[];
  compliance: ComplianceSummary;
  lowStockFlags: LowStockFlagItem[];
  sideworkTotal: number;
  sideworkDone: number;
  // Everything completed and nothing out of spec/failed/late/rejected — the
  // one-line-email condition. Low-stock and sidework are reported (spec:
  // "Sidework is reported separately... must never contribute to the
  // compliance completeness figure") but never factor into this.
  isClean: boolean;
};

export async function buildDailyReport(locationId: string, businessDate: string): Promise<DailyReportData> {
  const [location, definitions, compliance, lowStockFlagsRaw, sideworkTasks, sideworkDoneCount] = await Promise.all([
    prisma.location.findUniqueOrThrow({ where: { id: locationId } }),
    getEnabledLogDefinitions(locationId),
    computeComplianceSummary(locationId, [businessDate], businessDate),
    prisma.lowStockFlag.findMany({
      where: { locationId },
      include: { product: true },
    }),
    prisma.sideworkTask.count({ where: { locationIds: { has: locationId }, active: true } }),
    prisma.sideworkCompletion.count({ where: { locationId, businessDate, status: "DONE" } }),
  ]);

  // LowStockFlag has no businessDate column (it's a running "open right
  // now" concept, not a daily one) — "flagged that day" is derived from the
  // Pacific calendar date of raisedAt.
  const lowStockFlags: LowStockFlagItem[] = lowStockFlagsRaw
    .filter((f) => businessDateOf(f.raisedAt) === businessDate)
    .map((f) => ({
      productName: f.product.name,
      raisedSignatureName: f.raisedSignatureName,
      raiseCount: f.raiseCount,
      note: f.note,
    }));

  const expectedDefinitions = definitions.filter((d) => d.kind !== "receiving");
  const outstanding = compliance.missingByLog.map((m) => ({ logDefinitionId: m.logDefinitionId, name: m.name }));

  const isClean =
    outstanding.length === 0 &&
    compliance.outOfSpec.length === 0 &&
    compliance.failed.length === 0 &&
    compliance.late.length === 0 &&
    compliance.rejectedReceiving.length === 0;

  return {
    location: { id: location.id, name: location.name },
    businessDate,
    expectedCount: expectedDefinitions.length,
    completedCount: expectedDefinitions.length - outstanding.length,
    outstanding,
    compliance,
    lowStockFlags,
    sideworkTotal: sideworkTasks,
    sideworkDone: sideworkDoneCount,
    isClean,
  };
}

import { prisma } from "@/lib/prisma";
import { todayBusinessDate } from "@/lib/business-date";

function weekDates(weekStart: string): string[] {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setUTCDate(start.getUTCDate() + i);
    return dt.toISOString().slice(0, 10);
  });
}

export type WeekSummary = {
  weekStart: string;
  days: string[];
  missingByLog: { logDefinitionId: string; name: string; daysMissing: string[] }[];
  outOfSpecCount: number;
  failedCount: number;
  lateCount: number;
  rejectedReceivingCount: number;
  verification: {
    id: string;
    verifiedAt: string;
    comments: string | null;
    manager: { id: string; name: string; role: string };
  } | null;
};

// SQF requires verification of monitoring activities, not just the
// monitoring itself — this is what a manager reviews before signing off on
// a week: what's missing, what failed, what came in late, what a receiving
// review rejected.
export async function computeWeekSummary(locationId: string, weekStart: string): Promise<WeekSummary> {
  const days = weekDates(weekStart);
  const today = todayBusinessDate();

  const [definitions, entries, verification] = await Promise.all([
    prisma.logDefinition.findMany({ where: { active: true } }),
    prisma.logEntry.findMany({
      where: { locationId, businessDate: { in: days }, amendsId: null },
      include: { readings: true, itemChecks: true, receivingReview: true, logDefinition: true },
    }),
    prisma.verification.findFirst({
      where: { locationId, weekStart },
      include: { manager: { select: { id: true, name: true, role: true } } },
    }),
  ]);

  const presentByLog = new Map<string, Set<string>>();
  for (const e of entries) {
    if (!presentByLog.has(e.logDefinitionId)) presentByLog.set(e.logDefinitionId, new Set());
    presentByLog.get(e.logDefinitionId)!.add(e.businessDate);
  }

  const missingByLog = definitions
    // Receiving is multiple-per-day (or zero, if no delivery came) — "missing
    // days" doesn't mean anything for it the way it does for a daily sweep.
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

  const outOfSpecCount = entries.reduce((n, e) => n + e.readings.filter((r) => r.outOfSpec).length, 0);
  const failedCount = entries.reduce((n, e) => n + e.itemChecks.filter((c) => c.status === "FAIL").length, 0);
  const lateCount = entries.filter((e) => e.enteredLate).length;
  const rejectedReceivingCount = entries.filter(
    (e) =>
      e.logDefinition.kind === "receiving" &&
      e.receivingReview &&
      (!e.receivingReview.approved || !e.receivingReview.releasedForUse)
  ).length;

  return {
    weekStart,
    days,
    missingByLog,
    outOfSpecCount,
    failedCount,
    lateCount,
    rejectedReceivingCount,
    verification: verification
      ? {
          id: verification.id,
          verifiedAt: verification.verifiedAt.toISOString(),
          comments: verification.comments,
          manager: verification.manager,
        }
      : null,
  };
}

// Monday of the week containing `dateStr` (a YYYY-MM-DD business date).
export function mondayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = date.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  return date.toISOString().slice(0, 10);
}

export function recentWeekStarts(count: number): string[] {
  const thisMonday = mondayOf(todayBusinessDate());
  return Array.from({ length: count }, (_, i) => {
    const [y, m, d] = thisMonday.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() - 7 * i);
    return date.toISOString().slice(0, 10);
  });
}

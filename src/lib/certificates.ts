import { prisma } from "@/lib/prisma";

function formatShortDate(businessDate: string): string {
  // "2026-04-14" -> "14 April"
  const [y, m, d] = businessDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  return `${day} ${month}`;
}

function toBusinessDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type CertificateStatus = {
  id: string;
  name: string;
  ok: boolean;
  status: string;
};

// Derives certificate status by checking, for each log a certificate requires,
// whether every day in the lookback window (up to and including yesterday —
// today isn't over yet) has a submitted record at this location.
// Reports the first gap found, matching the single-line status the design shows.
export async function computeCertificateStatuses(
  locationId: string,
  lookbackDays = 30
): Promise<CertificateStatus[]> {
  const certificates = await prisma.certificate.findMany({
    include: {
      requirements: {
        where: {
          OR: [{ locationId }, { locationId: null }],
        },
        include: { logDefinition: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const today = new Date();
  const windowDates: string[] = [];
  for (let i = 1; i <= lookbackDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    windowDates.push(toBusinessDate(d));
  }
  const earliest = windowDates[windowDates.length - 1];

  const results: CertificateStatus[] = [];

  for (const cert of certificates) {
    let gap: { logName: string; businessDate: string } | null = null;

    for (const req of cert.requirements) {
      if (req.frequency !== "daily") continue;

      const submittedDates = new Set(
        (
          await prisma.logEntry.findMany({
            where: {
              locationId,
              logDefinitionId: req.logDefinitionId,
              amendsId: null,
              businessDate: { gte: earliest },
            },
            select: { businessDate: true },
          })
        ).map((e) => e.businessDate)
      );

      // windowDates is ordered most-recent-first (yesterday, the day before, ...);
      // report the most recent gap first, since that's what a manager cares about now.
      const missing = windowDates.find((d) => !submittedDates.has(d));

      if (missing) {
        gap = { logName: req.logDefinition.name, businessDate: missing };
        break;
      }
    }

    results.push({
      id: cert.id,
      name: cert.name,
      ok: !gap,
      status: gap
        ? `${gap.logName}: ${formatShortDate(gap.businessDate)} missing`
        : "Everything on file",
    });
  }

  return results;
}

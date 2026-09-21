// Business dates are plain "YYYY-MM-DD" strings, not UTC instants — a kitchen's
// calendar day, not a timezone-shifted timestamp. All kitchens are Pacific
// (Bay Area), so "today"/"yesterday" are computed explicitly in that zone —
// never bare server-local time, which on Vercel is UTC and would already be
// tomorrow after ~5pm Pacific.
const TIME_ZONE = "America/Los_Angeles";

function formatInZone(date: Date): string {
  // en-CA gives YYYY-MM-DD directly, no manual reassembly.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

export function todayBusinessDate(): string {
  return formatInZone(new Date());
}

export function yesterdayBusinessDate(): string {
  return formatInZone(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

// The business date a given instant falls on, in the kitchens' own zone —
// used where "today" isn't good enough, e.g. deciding which business date
// an amendment's submittedAt timestamp counts as.
export function businessDateOf(instant: Date): string {
  return formatInZone(instant);
}

// The current hour in the kitchens' zone (0-23). Cron schedules are UTC and
// drift across DST — this is how a job gates on "it's actually 1am Pacific"
// instead of hand-rolling a timezone offset that goes stale twice a year.
export function currentPacificHour(): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(new Date()));
}

const BUSINESS_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidBusinessDate(value: string): boolean {
  return BUSINESS_DATE_RE.test(value);
}

/**
 * The one place that decides whether a submitted businessDate is acceptable.
 * Only today (not late) or yesterday (late, reason required) are allowed —
 * the client's own idea of "today" is never trusted for this.
 */
export function classifySubmissionDate(
  businessDate: string,
  lateReason: string | undefined
): { ok: true; enteredLate: boolean; lateReason: string | null } | { ok: false; error: string } {
  const today = todayBusinessDate();
  if (businessDate === today) {
    return { ok: true, enteredLate: false, lateReason: null };
  }
  const yesterday = yesterdayBusinessDate();
  if (businessDate === yesterday) {
    if (!lateReason) {
      return { ok: false, error: "This entry is for yesterday — a reason is required before it can submit" };
    }
    return { ok: true, enteredLate: true, lateReason };
  }
  return { ok: false, error: `businessDate must be today (${today}) or yesterday (${yesterday}) with a reason` };
}

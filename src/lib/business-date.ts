// Business dates are plain "YYYY-MM-DD" strings, not UTC instants — a kitchen's
// calendar day, not a timezone-shifted timestamp. Callers pass one explicitly
// when it matters (e.g. offline entries synced later); this is just today's
// server-local fallback.
export function todayBusinessDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const BUSINESS_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidBusinessDate(value: string): boolean {
  return BUSINESS_DATE_RE.test(value);
}

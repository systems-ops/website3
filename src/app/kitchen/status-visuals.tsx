import type { CheckStatus } from "./types";

// The status colour system (item 7.1) — one vocabulary shared by every place
// a PASS/FAIL/NA status appears: the entry form, Records detail, and (per
// the spec) eventually the item 3 email. FAIL reuses --color-alert, the same
// red already used for an out-of-spec temperature reading, so a person
// learns the colour language once.
export const STATUS_STYLE: Record<CheckStatus, { fill: string; border: string; text: string }> = {
  PASS: { fill: "var(--color-pass-fill)", border: "var(--color-pass-border)", text: "var(--color-pass-text)" },
  FAIL: { fill: "var(--color-alert-fill)", border: "var(--color-alert-border)", text: "var(--color-alert-text)" },
  NA: { fill: "var(--color-na-fill)", border: "var(--color-na-border)", text: "var(--color-na)" },
};

// Never rely on colour alone — each selected state also carries a distinct
// shape, not just a hue, so it reads the same to someone colour-blind as to
// anyone else (roughly one man in twelve).
export function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "PASS") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "FAIL") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

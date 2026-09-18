import { describe, expect, it } from "vitest";
import { businessDateForInstant } from "./business-date";

// The business day rolls at 4am Pacific, not midnight — a restaurant's
// closing checklist is routinely finished after midnight, and without this
// cutover every one of those submissions would land on "yesterday" and get
// flagged late. These pin the boundary in both directions, in both DST
// states, since a fixed-hour UTC offset assumption here would silently
// break for half the year.
describe("businessDateForInstant — 4am Pacific cutover", () => {
  it("just before cutover (3:59am) is still the previous business day — winter (PST, UTC-8)", () => {
    expect(businessDateForInstant(new Date("2026-01-15T11:59:00Z"))).toBe("2026-01-14");
  });

  it("exactly at cutover (4:00am) rolls to the new business day — winter (PST, UTC-8)", () => {
    expect(businessDateForInstant(new Date("2026-01-15T12:00:00Z"))).toBe("2026-01-15");
  });

  it("just before cutover (3:59am) is still the previous business day — summer (PDT, UTC-7)", () => {
    expect(businessDateForInstant(new Date("2026-07-15T10:59:00Z"))).toBe("2026-07-14");
  });

  it("exactly at cutover (4:00am) rolls to the new business day — summer (PDT, UTC-7)", () => {
    expect(businessDateForInstant(new Date("2026-07-15T11:00:00Z"))).toBe("2026-07-15");
  });

  it("well into the afternoon is unaffected by the cutover", () => {
    expect(businessDateForInstant(new Date("2026-01-15T22:00:00Z"))).toBe("2026-01-15");
  });

  it("just before midnight is still that same business day", () => {
    // 11:59pm PST Jan 15 = 07:59 UTC Jan 16
    expect(businessDateForInstant(new Date("2026-01-16T07:59:00Z"))).toBe("2026-01-15");
  });
});

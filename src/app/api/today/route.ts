import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { todayBusinessDate } from "@/lib/business-date";
import { getCurrentSigner } from "@/lib/signer";
import { isRepeatableSubmission, SHIFT_AWARE_LOG_IDS } from "@/lib/log-entries";

const SHIFTS = ["OPENING", "RUNNING", "CLOSING"] as const;
const SHIFT_LABELS: Record<(typeof SHIFTS)[number], string> = {
  OPENING: "Opening",
  RUNNING: "Running",
  CLOSING: "Closing",
};

// GET /api/today?locationId=...&date=YYYY-MM-DD
// Splits active log definitions into "to do" and "done" for one location/day,
// mirroring the Today tab in the design.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) {
      throw new ApiError(400, "locationId is required");
    }
    const businessDate =
      req.nextUrl.searchParams.get("date") ?? todayBusinessDate();

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) throw new ApiError(404, "Location not found");

    const [allDefinitions, configs, entries] = await Promise.all([
      prisma.logDefinition.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          units: true,
          items: true,
        },
      }),
      prisma.locationLogKind.findMany({ where: { locationId } }),
      prisma.logEntry.findMany({
        where: { locationId, businessDate, amendsId: null },
        orderBy: { submittedAt: "asc" },
      }),
    ]);

    // Log kinds are per-location now (see LocationLogKind) — a restaurant
    // and the manufacturing site don't see the same form set. A form with
    // no config row for this location defaults to enabled, so a newly
    // added form doesn't silently vanish until someone turns it off.
    const configByDefId = new Map(configs.map((c) => [c.logDefinitionId, c]));
    const definitions = allDefinitions
      .filter((d) => configByDefId.get(d.id)?.enabled ?? true)
      .sort((a, b) => (configByDefId.get(a.id)?.sortOrder ?? 0) - (configByDefId.get(b.id)?.sortOrder ?? 0));

    const submittedByLog = new Map(entries.map((e) => [e.logDefinitionId, e]));

    const todo: unknown[] = [];
    const done: unknown[] = [];

    for (const def of definitions) {
      const name = configByDefId.get(def.id)?.displayLabel ?? def.name;

      // Receiving is a running log, not a once-a-day checkbox — a kitchen
      // can get several separate deliveries in one day. It always stays
      // available to add another, rather than locking into "done" after
      // the first one.
      if (def.kind === "receiving") {
        const countToday = entries.filter((e) => e.logDefinitionId === def.id).length;
        todo.push({
          logDefinitionId: def.id,
          name,
          kind: def.kind,
          sub: countToday > 0 ? `${countToday} logged today · tap to add another` : "Log the delivery",
        });
        continue;
      }

      // A shift-aware checklist (see LogItem.shift) is three separate due
      // items — opening and closing are each their own one-submission-
      // per-day thing, closing staying visibly pending until it's actually
      // done; running is repeatable through the shift (bathroom checks),
      // the same "always available, tap to add another" treatment as
      // Receiving gets. The composite id (`${logDefinitionId}:${shift}`) is
      // how the client tells the two API calls that follow which shift it
      // means — split on ":" there.
      if (SHIFT_AWARE_LOG_IDS.has(def.id)) {
        for (const shift of SHIFTS) {
          const compositeId = `${def.id}:${shift}`;
          const shiftItemCount = def.items.filter((i) => i.shift === shift).length;
          const shiftEntries = entries.filter((e) => e.logDefinitionId === def.id && e.shift === shift);

          if (isRepeatableSubmission(def.id, def.kind, shift)) {
            todo.push({
              logDefinitionId: compositeId,
              name: `${name} — ${SHIFT_LABELS[shift]}`,
              kind: def.kind,
              sub:
                shiftEntries.length > 0
                  ? `${shiftEntries.length} logged today · tap to add another`
                  : `${shiftItemCount} things to tick`,
            });
            continue;
          }

          const shiftEntry = shiftEntries[0];
          if (shiftEntry) {
            done.push({
              logDefinitionId: compositeId,
              name: `${name} — ${SHIFT_LABELS[shift]}`,
              entryId: shiftEntry.id,
              submittedAt: shiftEntry.submittedAt,
              signatureName: shiftEntry.signatureName,
            });
          } else {
            todo.push({
              logDefinitionId: compositeId,
              name: `${name} — ${SHIFT_LABELS[shift]}`,
              kind: def.kind,
              sub: `${shiftItemCount} things to tick`,
            });
          }
        }
        continue;
      }

      const entry = submittedByLog.get(def.id);
      const sub =
        def.kind === "temps"
          ? `${def.units.length} to check`
          : def.kind === "calibration"
            ? "Log each thermometer tested"
            : `${def.items.length} things to tick`;

      if (entry) {
        done.push({
          logDefinitionId: def.id,
          name,
          entryId: entry.id,
          submittedAt: entry.submittedAt,
          signatureName: entry.signatureName,
        });
      } else {
        todo.push({ logDefinitionId: def.id, name, kind: def.kind, sub });
      }
    }

    return NextResponse.json({
      location,
      businessDate,
      // Not definitions.length — a shift-aware checklist contributes three
      // separate due items (see above), so the real denominator is however
      // many todo/done rows actually got built.
      doneCount: done.length,
      totalCount: todo.length + done.length,
      todo,
      done,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

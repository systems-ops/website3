import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { todayBusinessDate } from "@/lib/business-date";

// GET /api/today?locationId=...&date=YYYY-MM-DD
// Splits active log definitions into "to do" and "done" for one location/day,
// mirroring the Today tab in the design.
export async function GET(req: NextRequest) {
  try {
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

    const [definitions, entries] = await Promise.all([
      prisma.logDefinition.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          units: true,
          items: true,
        },
      }),
      prisma.logEntry.findMany({
        where: { locationId, businessDate, amendsId: null },
        orderBy: { submittedAt: "asc" },
      }),
    ]);

    const submittedByLog = new Map(entries.map((e) => [e.logDefinitionId, e]));

    const todo: unknown[] = [];
    const done: unknown[] = [];

    for (const def of definitions) {
      // Receiving is a running log, not a once-a-day checkbox — a kitchen
      // can get several separate deliveries in one day. It always stays
      // available to add another, rather than locking into "done" after
      // the first one.
      if (def.kind === "receiving") {
        const countToday = entries.filter((e) => e.logDefinitionId === def.id).length;
        todo.push({
          logDefinitionId: def.id,
          name: def.name,
          kind: def.kind,
          sub: countToday > 0 ? `${countToday} logged today · tap to add another` : "Log the delivery",
        });
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
          name: def.name,
          entryId: entry.id,
          submittedAt: entry.submittedAt,
          signatureName: entry.signatureName,
        });
      } else {
        todo.push({ logDefinitionId: def.id, name: def.name, kind: def.kind, sub });
      }
    }

    return NextResponse.json({
      location,
      businessDate,
      doneCount: done.length,
      totalCount: definitions.length,
      todo,
      done,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

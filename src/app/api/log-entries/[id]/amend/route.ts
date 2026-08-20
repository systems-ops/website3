import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { amendLogEntrySchema } from "@/lib/log-entry-schemas";
import { buildLogEntryCreateData } from "@/lib/log-entries";
import { getCurrentCook } from "@/lib/session";

// POST /api/log-entries/:id/amend
// Records are immutable once signed — this creates a *new* row referencing
// the original via amendsId rather than updating it, so an auditor can always
// prove whether a record was changed after the fact.
export async function POST(
  req: Request,
  ctx: RouteContext<"/api/log-entries/[id]/amend">
) {
  try {
    const cook = await getCurrentCook();
    if (!cook) throw new ApiError(401, "Sign in first");

    const { id } = await ctx.params;
    const body = amendLogEntrySchema.parse(await req.json());

    const original = await prisma.logEntry.findUnique({ where: { id } });
    if (!original) throw new ApiError(404, "Log entry not found");

    if (!cook.locations.some((l) => l.locationId === original.locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const childData = await buildLogEntryCreateData(body, original.logDefinitionId);

    const amendment = await prisma.logEntry.create({
      data: {
        location: { connect: { id: original.locationId } },
        logDefinition: { connect: { id: original.logDefinitionId } },
        businessDate: original.businessDate,
        submittedBy: cook.id,
        signatureName: cook.name,
        amends: { connect: { id: original.id } },
        ...(childData.readings ? { readings: { create: childData.readings } } : {}),
        ...(childData.itemChecks ? { itemChecks: { create: childData.itemChecks } } : {}),
        ...(childData.calibrationRows ? { calibrationRows: { create: childData.calibrationRows } } : {}),
      },
      include: {
        readings: { include: { logUnit: true } },
        itemChecks: { include: { logItem: true } },
        calibrationRows: { orderBy: { rowIndex: "asc" } },
      },
    });

    return NextResponse.json({ entry: amendment }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { amendLogEntrySchema } from "@/lib/log-entry-schemas";
import { buildLogEntryCreateData } from "@/lib/log-entries";

// POST /api/log-entries/:id/amend
// Records are immutable once signed — this creates a *new* row referencing
// the original via amendsId rather than updating it, so an auditor can always
// prove whether a record was changed after the fact.
export async function POST(
  req: Request,
  ctx: RouteContext<"/api/log-entries/[id]/amend">
) {
  try {
    const { id } = await ctx.params;
    const body = amendLogEntrySchema.parse(await req.json());

    const original = await prisma.logEntry.findUnique({ where: { id } });
    if (!original) throw new ApiError(404, "Log entry not found");

    const childData = await buildLogEntryCreateData(body, original.logDefinitionId);

    const amendment = await prisma.logEntry.create({
      data: {
        location: { connect: { id: original.locationId } },
        logDefinition: { connect: { id: original.logDefinitionId } },
        businessDate: original.businessDate,
        submittedBy: body.submittedBy,
        signatureName: body.signatureName,
        amends: { connect: { id: original.id } },
        ...(childData.readings ? { readings: { create: childData.readings } } : {}),
        ...(childData.itemChecks ? { itemChecks: { create: childData.itemChecks } } : {}),
      },
      include: {
        readings: { include: { logUnit: true } },
        itemChecks: { include: { logItem: true } },
      },
    });

    return NextResponse.json({ entry: amendment }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

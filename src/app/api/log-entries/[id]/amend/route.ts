import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { amendLogEntrySchema } from "@/lib/log-entry-schemas";
import { buildLogEntryCreateData } from "@/lib/log-entries";
import { getCurrentSigner } from "@/lib/signer";

// POST /api/log-entries/:id/amend
// Records are immutable once signed — this creates a *new* row referencing
// the original via amendsId rather than updating it, so an auditor can always
// prove whether a record was changed after the fact.
export async function POST(
  req: Request,
  ctx: RouteContext<"/api/log-entries/[id]/amend">
) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const { id } = await ctx.params;
    const body = amendLogEntrySchema.parse(await req.json());

    const original = await prisma.logEntry.findUnique({ where: { id } });
    if (!original) throw new ApiError(404, "Log entry not found");

    if (signer.kind === "cook" && !signer.locationIds.includes(original.locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const childData = await buildLogEntryCreateData(body, original.logDefinitionId);

    const amendment = await prisma.logEntry.create({
      data: {
        location: { connect: { id: original.locationId } },
        logDefinition: { connect: { id: original.logDefinitionId } },
        businessDate: original.businessDate,
        submittedBy: signer.id,
        signatureName: signer.kind === "manager" ? `${signer.name} (${signer.role})` : signer.name,
        amends: { connect: { id: original.id } },
        ...(childData.readings ? { readings: { create: childData.readings } } : {}),
        ...(childData.itemChecks ? { itemChecks: { create: childData.itemChecks } } : {}),
        ...(childData.calibrationRows ? { calibrationRows: { create: childData.calibrationRows } } : {}),
        ...(childData.receivingDetail ? { receivingDetail: { create: childData.receivingDetail } } : {}),
      },
      include: {
        readings: { include: { logUnit: true } },
        itemChecks: { include: { logItem: true } },
        calibrationRows: { orderBy: { rowIndex: "asc" } },
        receivingDetail: { include: { lines: { orderBy: { rowIndex: "asc" } } } },
      },
    });

    return NextResponse.json({ entry: amendment }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { amendLogEntrySchema } from "@/lib/log-entry-schemas";
import { buildLogEntryCreateData } from "@/lib/log-entries";
import { getCurrentSigner } from "@/lib/signer";
import { todayBusinessDate } from "@/lib/business-date";

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

    // Same-day corrections stay cook-level; amending anything from a
    // previous day needs a manager's PIN.
    if (original.businessDate !== todayBusinessDate() && signer.kind !== "manager") {
      throw new ApiError(403, "Amending a record from a previous day requires a manager");
    }

    const childData = await buildLogEntryCreateData(body, original.logDefinitionId);

    const amendment = await prisma.logEntry.create({
      data: {
        location: { connect: { id: original.locationId } },
        logDefinition: { connect: { id: original.logDefinitionId } },
        businessDate: original.businessDate,
        submittedBy: signer.id,
        signatureName: signer.kind === "manager" ? `${signer.name} (${signer.role})` : signer.name,
        // The amendment isn't itself a late *submission* — it's a
        // correction to an already-recorded day. Lateness carries forward
        // from the original rather than being re-derived.
        enteredLate: original.enteredLate,
        lateReason: original.lateReason,
        amendReason: body.amendReason,
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

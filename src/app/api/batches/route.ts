import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { createBatchSchema } from "@/lib/batch-schemas";
import { getCurrentSigner } from "@/lib/signer";
import { classifySubmissionDate } from "@/lib/business-date";

// GET /api/batches?locationId=&month=YYYY-MM
// Powers a Records-style calendar view of production batches for a kitchen.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const params = req.nextUrl.searchParams;
    const locationId = params.get("locationId");
    const month = params.get("month");
    if (!locationId) throw new ApiError(400, "locationId is required");
    if (signer.kind === "cook" && !signer.locationIds.includes(locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const where: Record<string, unknown> = { locationId };
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) throw new ApiError(400, "month must be YYYY-MM");
      where.businessDate = { startsWith: month };
    }

    const batches = await prisma.productionBatch.findMany({
      where,
      orderBy: { producedAt: "desc" },
      include: { inputs: true, outputs: true },
    });

    return NextResponse.json({ batches });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/batches
// Records a production batch: which received lots went in, what came out.
// This is the traceability record a recall would start from, so every input
// snapshots the supplier's product name/lot number at write time — the same
// principle as Reading.specLow/specHigh not moving when a spec changes later.
export async function POST(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const body = createBatchSchema.parse(await req.json());

    if (signer.kind === "cook" && !signer.locationIds.includes(body.locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const dateCheck = classifySubmissionDate(body.businessDate, body.lateReason);
    if (!dateCheck.ok) throw new ApiError(400, dateCheck.error);

    const location = await prisma.location.findUnique({ where: { id: body.locationId } });
    if (!location) throw new ApiError(404, "Location not found");

    const existingCode = await prisma.productionBatch.findFirst({
      where: { locationId: body.locationId, batchCode: body.batchCode },
    });
    if (existingCode) throw new ApiError(409, "This batch code is already in use at this kitchen");

    const receivingLines = await prisma.receivingLine.findMany({
      where: { id: { in: body.inputs.map((i) => i.receivingLineId) } },
      include: { receivingDetail: { include: { logEntry: true } } },
    });
    if (receivingLines.length !== body.inputs.length) {
      throw new ApiError(400, "One or more received lots could not be found");
    }
    for (const line of receivingLines) {
      if (line.receivingDetail.logEntry.locationId !== body.locationId) {
        throw new ApiError(400, "A received lot belongs to a different kitchen");
      }
    }
    const lineById = new Map(receivingLines.map((l) => [l.id, l]));

    const batch = await prisma.productionBatch.create({
      data: {
        location: { connect: { id: body.locationId } },
        businessDate: body.businessDate,
        batchCode: body.batchCode,
        productType: body.productType,
        quantity: body.quantity ?? null,
        submittedBy: signer.id,
        signatureName: signer.kind === "manager" ? `${signer.name} (${signer.role})` : signer.name,
        enteredLate: dateCheck.enteredLate,
        lateReason: dateCheck.lateReason,
        inputs: {
          create: body.inputs.map((i) => {
            const line = lineById.get(i.receivingLineId)!;
            return {
              receivingLine: { connect: { id: i.receivingLineId } },
              productNameSnapshot: line.productName,
              supplierLotNumber: line.lotNumber,
            };
          }),
        },
        outputs: {
          create: body.outputs.map((o) => ({
            productName: o.productName,
            quantity: o.quantity ?? null,
            bakeDate: o.bakeDate,
            bestByDate: o.bestByDate ?? null,
            disposition: o.disposition,
            reference: o.reference ?? null,
          })),
        },
      },
      include: { inputs: true, outputs: true },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

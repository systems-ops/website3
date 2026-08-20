import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { createLogEntrySchema } from "@/lib/log-entry-schemas";
import { buildLogEntryCreateData } from "@/lib/log-entries";
import { getCurrentSigner } from "@/lib/signer";

// GET /api/log-entries?locationId=&logDefinitionId=&month=YYYY-MM&date=YYYY-MM-DD
// Powers the Records tab: month calendar and single-day detail.
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const locationId = params.get("locationId");
    const logDefinitionId = params.get("logDefinitionId");
    const month = params.get("month");
    const date = params.get("date");

    if (!locationId) throw new ApiError(400, "locationId is required");

    const where: Record<string, unknown> = { locationId, amendsId: null };
    if (logDefinitionId) where.logDefinitionId = logDefinitionId;
    if (date) {
      where.businessDate = date;
    } else if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new ApiError(400, "month must be YYYY-MM");
      }
      where.businessDate = { startsWith: month };
    }

    const entries = await prisma.logEntry.findMany({
      where,
      orderBy: { businessDate: "asc" },
      include: {
        readings: { include: { logUnit: true } },
        itemChecks: { include: { logItem: true } },
        calibrationRows: { orderBy: { rowIndex: "asc" } },
        receivingDetail: { include: { lines: { orderBy: { rowIndex: "asc" } } } },
        receivingReview: { include: { manager: { select: { id: true, name: true, role: true } } } },
        amendments: true,
        logDefinition: true,
      },
    });

    return NextResponse.json({ entries });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/log-entries
// Submits a new record. Records are immutable once created — resubmitting
// the same location/log/day is rejected; use POST /api/log-entries/:id/amend
// for corrections.
export async function POST(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const body = createLogEntrySchema.parse(await req.json());

    if (signer.kind === "cook" && !signer.locationIds.includes(body.locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const [location, definition] = await Promise.all([
      prisma.location.findUnique({ where: { id: body.locationId } }),
      prisma.logDefinition.findUnique({ where: { id: body.logDefinitionId } }),
    ]);
    if (!location) throw new ApiError(404, "Location not found");
    if (!definition) throw new ApiError(404, "Log definition not found");

    const existing = await prisma.logEntry.findFirst({
      where: {
        locationId: body.locationId,
        logDefinitionId: body.logDefinitionId,
        businessDate: body.businessDate,
        amendsId: null,
      },
    });
    if (existing) {
      throw new ApiError(
        409,
        "This log was already submitted for that date and location. Use the amend endpoint to correct it."
      );
    }

    const childData = await buildLogEntryCreateData(body, body.logDefinitionId);

    const entry = await prisma.logEntry.create({
      data: {
        location: { connect: { id: body.locationId } },
        logDefinition: { connect: { id: body.logDefinitionId } },
        businessDate: body.businessDate,
        submittedBy: signer.id,
        signatureName: signer.kind === "manager" ? `${signer.name} (${signer.role})` : signer.name,
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

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

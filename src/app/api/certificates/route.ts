import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { computeCertificateStatuses } from "@/lib/certificates";
import { getCurrentSigner } from "@/lib/signer";

// GET /api/certificates?locationId=&days=30
// Derives certificate status from actual log_entries instead of hardcoding it.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new ApiError(404, "Location not found");

    const daysParam = req.nextUrl.searchParams.get("days");
    const lookbackDays = daysParam ? Number(daysParam) : 30;
    if (!Number.isInteger(lookbackDays) || lookbackDays <= 0) {
      throw new ApiError(400, "days must be a positive integer");
    }

    const certificates = await computeCertificateStatuses(locationId, lookbackDays);
    return NextResponse.json({ certificates });
  } catch (err) {
    return handleApiError(err);
  }
}

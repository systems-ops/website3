import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { verificationInputSchema } from "@/lib/log-entry-schemas";
import { getCurrentManager } from "@/lib/manager-session";
import { computeWeekSummary, mondayOf, recentWeekStarts } from "@/lib/verification";

const createVerificationSchema = verificationInputSchema.extend({ locationId: z.string() });

// GET /api/verifications?locationId=&weeks=4
// Manager-only: the last N weeks for a location, each with its summary
// (out-of-spec/failed/late counts, missing days, and verification status).
export async function GET(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(401, "Sign in as a manager first");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");

    const weeksParam = req.nextUrl.searchParams.get("weeks");
    const weeks = weeksParam ? Number(weeksParam) : 4;
    if (!Number.isInteger(weeks) || weeks <= 0 || weeks > 26) {
      throw new ApiError(400, "weeks must be an integer between 1 and 26");
    }

    const summaries = await Promise.all(
      recentWeekStarts(weeks).map((weekStart) => computeWeekSummary(locationId, weekStart))
    );

    return NextResponse.json({ weeks: summaries });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/verifications { locationId, weekStart, comments? }
// A manager's one-time attestation that they reviewed a location's week.
export async function POST(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(401, "Sign in as a manager first");

    const body = createVerificationSchema.parse(await req.json());

    if (body.weekStart !== mondayOf(body.weekStart)) {
      throw new ApiError(400, "weekStart must be a Monday");
    }

    const location = await prisma.location.findUnique({ where: { id: body.locationId } });
    if (!location) throw new ApiError(404, "Location not found");

    const existing = await prisma.verification.findFirst({
      where: { locationId: body.locationId, weekStart: body.weekStart },
    });
    if (existing) throw new ApiError(409, "This week has already been verified");

    const verification = await prisma.verification.create({
      data: {
        location: { connect: { id: body.locationId } },
        manager: { connect: { id: manager.id } },
        weekStart: body.weekStart,
        comments: body.comments ?? null,
      },
      include: { manager: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({ verification }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

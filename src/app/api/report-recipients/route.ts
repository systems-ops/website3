import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { createReportRecipientSchema } from "@/lib/report-recipient-schemas";

// GET /api/report-recipients?locationId= — manager-only. Recipients are
// manager-editable, not hardcoded, per the spec.
export async function GET(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");

    const recipients = await prisma.reportRecipient.findMany({
      where: { locationId, active: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ recipients });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const body = createReportRecipientSchema.parse(await req.json());

    const recipient = await prisma.reportRecipient.upsert({
      where: { locationId_email: { locationId: body.locationId, email: body.email } },
      update: { active: true },
      create: { locationId: body.locationId, email: body.email },
    });

    return NextResponse.json({ recipient }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

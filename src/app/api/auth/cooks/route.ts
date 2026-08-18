import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";

// GET /api/auth/cooks?locationId=...
// Names only — used to render the "who are you" picker before the PIN pad.
// Never returns pinHash.
export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");

    const cooks = await prisma.cook.findMany({
      where: { active: true, locations: { some: { locationId } } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ cooks });
  } catch (err) {
    return handleApiError(err);
  }
}

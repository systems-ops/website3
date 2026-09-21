import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";

// GET /api/low-stock-flags?locationId= — manager-only live view of
// everything currently flagged running-low at a location.
export async function GET(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");

    const flags = await prisma.lowStockFlag.findMany({
      where: { locationId, status: "OPEN" },
      include: { product: true },
      orderBy: { raisedAt: "asc" },
    });

    return NextResponse.json({
      flags: flags.map((f) => ({
        id: f.id,
        productId: f.productId,
        productName: f.product.name,
        raisedAt: f.raisedAt,
        raisedSignatureName: f.raisedSignatureName,
        raiseCount: f.raiseCount,
        note: f.note,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

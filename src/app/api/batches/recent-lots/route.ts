import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { recentReceivedLots } from "@/lib/trace";

// GET /api/batches/recent-lots?locationId=
// Feeds the batch-entry chip picker: recently received lots to tap instead
// of typing lot numbers.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");
    if (signer.kind === "cook" && !signer.locationIds.includes(locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const lots = await recentReceivedLots(locationId);
    return NextResponse.json({ lots });
  } catch (err) {
    return handleApiError(err);
  }
}

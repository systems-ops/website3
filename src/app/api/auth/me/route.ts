import { NextResponse } from "next/server";
import { getCurrentCook } from "@/lib/session";
import { handleApiError } from "@/lib/api-errors";

export async function GET() {
  try {
    const cook = await getCurrentCook();
    if (!cook) return NextResponse.json({ cook: null });
    return NextResponse.json({
      cook: {
        id: cook.id,
        name: cook.name,
        locationIds: cook.locations.map((l) => l.locationId),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

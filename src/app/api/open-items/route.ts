import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { createOpenItemSchema } from "@/lib/product-schemas";
import { createOpenItem } from "@/lib/open-items";

// GET /api/open-items?locationId=&onHandOnly=
// Backs both the Products tab's on-hand list and the Today tab's "expires
// today/tomorrow" surface — the client filters by useByDate, there's no
// separate "expiring" endpoint to keep in sync with this one.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");
    if (signer.kind === "cook" && !signer.locationIds.includes(locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const onHandOnly = req.nextUrl.searchParams.get("onHandOnly") === "true";

    const items = await prisma.openItem.findMany({
      where: { locationId, ...(onHandOnly ? { disposition: "ON_HAND" } : {}) },
      orderBy: [{ useByDate: "asc" }, { createdAt: "asc" }],
      take: 300,
    });

    return NextResponse.json({ items });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/open-items — the prep-label flow. Cook or manager.
export async function POST(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const body = createOpenItemSchema.parse(await req.json());
    if (signer.kind === "cook" && !signer.locationIds.includes(body.locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const item = await createOpenItem({ ...body, signer });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

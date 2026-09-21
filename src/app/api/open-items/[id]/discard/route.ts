import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { discardOpenItemSchema } from "@/lib/product-schemas";
import { discardOpenItem } from "@/lib/open-items";

// POST /api/open-items/[id]/discard — cook or manager, reason required.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/open-items/[id]/discard">) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const { id } = await ctx.params;
    const body = discardOpenItemSchema.parse(await req.json());

    const item = await discardOpenItem({ itemId: id, reason: body.reason, signer });
    return NextResponse.json({ item });
  } catch (err) {
    return handleApiError(err);
  }
}

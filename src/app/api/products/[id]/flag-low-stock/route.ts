import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { raiseLowStockSchema } from "@/lib/product-schemas";
import { raiseLowStockFlag } from "@/lib/low-stock";

// POST /api/products/[id]/flag-low-stock
// Cook or manager, one tap. No quantity, no count — see schema.prisma.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/products/[id]/flag-low-stock">) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const { id } = await ctx.params;
    const body = raiseLowStockSchema.parse(await req.json());
    if (signer.kind === "cook" && !signer.locationIds.includes(body.locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const flag = await raiseLowStockFlag({
      productId: id,
      locationId: body.locationId,
      note: body.note,
      signer,
    });

    return NextResponse.json({ flag });
  } catch (err) {
    return handleApiError(err);
  }
}

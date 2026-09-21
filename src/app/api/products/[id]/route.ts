import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { updateProductSchema } from "@/lib/product-schemas";

// PATCH /api/products/[id] — manager-only.
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const { id } = await ctx.params;
    const body = updateProductSchema.parse(await req.json());

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Product not found");

    const product = await prisma.product.update({ where: { id }, data: body });
    return NextResponse.json({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

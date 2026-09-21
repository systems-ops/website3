import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { clearLowStockSchema } from "@/lib/product-schemas";
import { clearLowStockFlag } from "@/lib/low-stock";

// POST /api/products/[id]/clear-low-stock — manager-only. Clears whichever
// flag is currently open on this product; never on a timer, only on a
// manager's say-so that it was ordered or received.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/products/[id]/clear-low-stock">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const { id } = await ctx.params;
    const body = clearLowStockSchema.parse(await req.json());

    const openFlag = await prisma.lowStockFlag.findFirst({ where: { productId: id, status: "OPEN" } });
    if (!openFlag) throw new ApiError(404, "No open flag on this product");

    const flag = await clearLowStockFlag({
      flagId: openFlag.id,
      disposition: body.disposition,
      manager: { kind: "manager", id: manager.id, name: manager.name, role: manager.role },
    });

    return NextResponse.json({ flag });
  } catch (err) {
    return handleApiError(err);
  }
}

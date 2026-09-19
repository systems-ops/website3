import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";

// DELETE /api/training-resources/links/[linkId] — manager-only.
export async function DELETE(_req: Request, ctx: RouteContext<"/api/training-resources/links/[linkId]">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const { linkId } = await ctx.params;
    const existing = await prisma.trainingResourceLink.findUnique({ where: { id: linkId } });
    if (!existing) throw new ApiError(404, "Link not found");

    await prisma.trainingResourceLink.delete({ where: { id: linkId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}

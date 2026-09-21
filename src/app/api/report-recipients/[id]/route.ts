import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";

// DELETE /api/report-recipients/[id] — manager-only. Soft-deactivate
// rather than hard-delete, consistent with every other manager-editable
// list in this app (products, sidework tasks, training resources).
export async function DELETE(_req: Request, ctx: RouteContext<"/api/report-recipients/[id]">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const { id } = await ctx.params;
    const existing = await prisma.reportRecipient.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Recipient not found");

    await prisma.reportRecipient.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}

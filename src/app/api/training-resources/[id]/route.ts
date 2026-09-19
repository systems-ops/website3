import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { updateTrainingResourceSchema } from "@/lib/training-schemas";

// PATCH /api/training-resources/[id] — manager-only.
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/training-resources/[id]">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const { id } = await ctx.params;
    const body = updateTrainingResourceSchema.parse(await req.json());

    const existing = await prisma.trainingResource.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Resource not found");

    const resource = await prisma.trainingResource.update({ where: { id }, data: body });
    return NextResponse.json({ resource });
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { createTrainingLinkSchema } from "@/lib/training-schemas";

// POST /api/training-resources/[id]/links — manager-only. Attaches a
// resource to a form (logItemId omitted) or a specific checklist line on
// one (logItemId set) — this is what makes it surface inline on that form.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/training-resources/[id]/links">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const { id } = await ctx.params;
    const body = createTrainingLinkSchema.parse(await req.json());

    const resource = await prisma.trainingResource.findUnique({ where: { id } });
    if (!resource) throw new ApiError(404, "Resource not found");

    if (body.logItemId) {
      const item = await prisma.logItem.findUnique({ where: { id: body.logItemId } });
      if (!item || item.logDefinitionId !== body.logDefinitionId) {
        throw new ApiError(400, "That checklist item doesn't belong to that form");
      }
    }

    const link = await prisma.trainingResourceLink.create({
      data: {
        trainingResourceId: id,
        logDefinitionId: body.logDefinitionId,
        logItemId: body.logItemId,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

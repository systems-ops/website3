import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { updateSideworkTaskSchema } from "@/lib/sidework-schemas";

// PATCH /api/sidework-tasks/:id
// Manager-only. Edits (or deactivates) a task — no deploy needed to change
// a sidework list. Deactivating doesn't delete history: SideworkCompletion
// rows are operational, not evidentiary, and simply stop being generated
// for a task once it's inactive.
export async function PATCH(req: Request, ctx: RouteContext<"/api/sidework-tasks/[id]">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const { id } = await ctx.params;
    const body = updateSideworkTaskSchema.parse(await req.json());

    const existing = await prisma.sideworkTask.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Task not found");

    const task = await prisma.sideworkTask.update({ where: { id }, data: body });
    return NextResponse.json({ task });
  } catch (err) {
    return handleApiError(err);
  }
}

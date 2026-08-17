import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";

export async function GET(_req: Request, ctx: RouteContext<"/api/log-entries/[id]">) {
  try {
    const { id } = await ctx.params;
    const entry = await prisma.logEntry.findUnique({
      where: { id },
      include: {
        location: true,
        logDefinition: true,
        readings: { include: { logUnit: true }, orderBy: { slotIndex: "asc" } },
        itemChecks: { include: { logItem: true } },
        amends: true,
        amendments: {
          include: {
            readings: { include: { logUnit: true } },
            itemChecks: { include: { logItem: true } },
          },
        },
      },
    });
    if (!entry) throw new ApiError(404, "Log entry not found");
    return NextResponse.json({ entry });
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";

export async function GET(_req: Request, ctx: RouteContext<"/api/log-entries/[id]">) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const { id } = await ctx.params;
    const entry = await prisma.logEntry.findUnique({
      where: { id },
      include: {
        location: true,
        logDefinition: true,
        readings: { include: { logUnit: true }, orderBy: { slotIndex: "asc" } },
        itemChecks: { include: { logItem: true } },
        calibrationRows: { orderBy: { rowIndex: "asc" } },
        receivingDetail: { include: { lines: { orderBy: { rowIndex: "asc" } } } },
        receivingReview: { include: { manager: { select: { id: true, name: true, role: true } } } },
        amends: true,
        amendments: {
          include: {
            readings: { include: { logUnit: true } },
            itemChecks: { include: { logItem: true } },
            calibrationRows: { orderBy: { rowIndex: "asc" } },
            receivingDetail: { include: { lines: { orderBy: { rowIndex: "asc" } } } },
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

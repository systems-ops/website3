import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { receivingReviewInputSchema } from "@/lib/log-entry-schemas";
import { getCurrentManager } from "@/lib/manager-session";

// POST /api/log-entries/:id/receiving-review
// The management testing/approval step on a Receiving Log entry (FR-40) —
// separate from intake, done later, by a specific named manager. One review
// per entry: this doesn't overwrite, it's a one-time add.
export async function POST(req: Request, ctx: RouteContext<"/api/log-entries/[id]/receiving-review">) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(401, "Sign in as a manager first");

    const { id } = await ctx.params;
    const body = receivingReviewInputSchema.parse(await req.json());

    const entry = await prisma.logEntry.findUnique({
      where: { id },
      include: { logDefinition: true, receivingReview: true },
    });
    if (!entry) throw new ApiError(404, "Log entry not found");
    if (entry.logDefinition.kind !== "receiving") {
      throw new ApiError(400, "This entry isn't a receiving log");
    }
    if (entry.receivingReview) {
      throw new ApiError(409, "This entry already has a review");
    }

    const review = await prisma.receivingReview.create({
      data: {
        logEntry: { connect: { id: entry.id } },
        manager: { connect: { id: manager.id } },
        totalCount: body.totalCount ?? null,
        countTested: body.countTested ?? null,
        standardsReviewed: body.standardsReviewed ?? null,
        coaReference: body.coaReference ?? null,
        approved: body.approved,
        rejectedReason: body.rejectedReason ?? null,
        storageLocation: body.storageLocation ?? null,
        storageCcps: body.storageCcps ?? null,
        comments: body.comments ?? null,
        releasedForUse: body.releasedForUse,
      },
      include: { manager: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

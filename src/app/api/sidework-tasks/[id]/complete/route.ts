import { NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { sideworkActionSchema } from "@/lib/sidework-schemas";
import { setSideworkStatus } from "@/lib/sidework";

// POST /api/sidework-tasks/:id/complete
// "Tap to complete" — works whether or not the task was claimed first;
// claiming is informational, not a required step.
export async function POST(req: Request, ctx: RouteContext<"/api/sidework-tasks/[id]/complete">) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const { id } = await ctx.params;
    const body = sideworkActionSchema.parse(await req.json());
    if (signer.kind === "cook" && !signer.locationIds.includes(body.locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const completion = await setSideworkStatus({
      taskId: id,
      locationId: body.locationId,
      businessDate: body.businessDate,
      status: "DONE",
      signer,
    });

    return NextResponse.json({ completion });
  } catch (err) {
    return handleApiError(err);
  }
}

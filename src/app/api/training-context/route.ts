import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { getTrainingContext } from "@/lib/training";

// GET /api/training-context?logDefinitionId=&logItemIds=id1,id2,...
// Backs the inline "collapsed, one tap" links on EntryFlow — form-level
// resources plus whichever items on this specific form have their own.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const logDefinitionId = req.nextUrl.searchParams.get("logDefinitionId");
    if (!logDefinitionId) throw new ApiError(400, "logDefinitionId is required");

    const logItemIdsParam = req.nextUrl.searchParams.get("logItemIds") ?? "";
    const logItemIds = logItemIdsParam.split(",").filter(Boolean);

    const context = await getTrainingContext({ logDefinitionId, logItemIds });
    return NextResponse.json(context);
  } catch (err) {
    return handleApiError(err);
  }
}

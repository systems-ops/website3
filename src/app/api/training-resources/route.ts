import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { getCurrentManager } from "@/lib/manager-session";
import { listTrainingResources } from "@/lib/training";
import { createTrainingResourceSchema } from "@/lib/training-schemas";

// GET /api/training-resources?locationId=&includeInactive=
// The Training tab: everything applicable to the signed-in location,
// grouped by category client-side. includeInactive is manager-only, for
// the resource-library editor.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");
    if (signer.kind === "cook" && !signer.locationIds.includes(locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";
    if (includeInactive && !(await getCurrentManager())) {
      throw new ApiError(403, "Manager sign-in required");
    }

    const resources = await listTrainingResources({ locationId, includeInactive });
    return NextResponse.json({ resources });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/training-resources — manager-only, no deploy required to add or
// update a link, per the spec's explicit warning against a hardcoded list.
export async function POST(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const body = createTrainingResourceSchema.parse(await req.json());

    const maxSortOrder = await prisma.trainingResource.aggregate({
      where: { category: body.category },
      _max: { sortOrder: true },
    });

    const resource = await prisma.trainingResource.create({
      data: {
        title: body.title,
        description: body.description,
        url: body.url,
        category: body.category,
        applicableRoles: body.applicableRoles,
        applicableLocationIds: body.applicableLocationIds,
        sortOrder: body.sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

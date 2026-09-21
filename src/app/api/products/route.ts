import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { getCurrentManager } from "@/lib/manager-session";
import { createProductSchema } from "@/lib/product-schemas";

// GET /api/products?locationId=&includeInactive=
// Item 5 — the shared per-location product list behind both low-stock
// flagging (5a) and open-item expiry tracking (5b). Returns each product's
// current open low-stock flag, if any, so the cook-facing list can show
// what's already flagged without a second round-trip.
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

    const [products, openFlags] = await Promise.all([
      prisma.product.findMany({
        where: { locationId, ...(includeInactive ? {} : { active: true }) },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.lowStockFlag.findMany({ where: { locationId, status: "OPEN" } }),
    ]);

    const flagByProductId = new Map(openFlags.map((f) => [f.productId, f]));

    return NextResponse.json({
      products: products.map((p) => {
        const flag = flagByProductId.get(p.id);
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          shelfLifeDays: p.shelfLifeDays,
          sortOrder: p.sortOrder,
          active: p.active,
          lowStockFlag: flag
            ? {
                id: flag.id,
                raisedAt: flag.raisedAt,
                raisedSignatureName: flag.raisedSignatureName,
                raiseCount: flag.raiseCount,
                note: flag.note,
              }
            : null,
        };
      }),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/products — manager-only, no deploy required to add one.
export async function POST(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const body = createProductSchema.parse(await req.json());

    const maxSortOrder = await prisma.product.aggregate({
      where: { locationId: body.locationId },
      _max: { sortOrder: true },
    });

    const product = await prisma.product.create({
      data: {
        locationId: body.locationId,
        name: body.name,
        category: body.category,
        shelfLifeDays: body.shelfLifeDays,
        sortOrder: body.sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

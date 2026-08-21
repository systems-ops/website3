import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";

// Returns the digitized paper forms with their units/checklist items and
// corrective-action presets, ready for a client to render an entry flow.
export async function GET() {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const [definitions, fallbackActions] = await Promise.all([
      prisma.logDefinition.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          units: { orderBy: { sortOrder: "asc" } },
          items: { orderBy: { sortOrder: "asc" } },
          correctiveActionOptions: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.correctiveActionOption.findMany({
        where: { logDefinitionId: null },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const logs = definitions.map((def) => ({
      id: def.id,
      name: def.name,
      formCode: def.formCode,
      kind: def.kind,
      unit: def.unit,
      slots: def.slots,
      revision: def.revision,
      units: def.units,
      items: def.items,
      correctiveActions: def.correctiveActionOptions.length
        ? def.correctiveActionOptions.map((o) => o.text)
        : fallbackActions.map((o) => o.text),
    }));

    return NextResponse.json({ logs });
  } catch (err) {
    return handleApiError(err);
  }
}

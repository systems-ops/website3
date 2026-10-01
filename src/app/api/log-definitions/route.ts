import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";

// GET /api/log-definitions?locationId=
// Returns the digitized paper forms with their units/checklist items and
// corrective-action presets, ready for a client to render an entry flow.
// With locationId, this is scoped to that location's enabled forms, with
// its displayLabel/formReference overrides applied — the three sites don't
// share a form set (see LocationLogKind). Without locationId, every active
// form everywhere is returned unfiltered (used where no single location is
// in play yet, e.g. before a kitchen is chosen).
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const locationId = req.nextUrl.searchParams.get("locationId");

    const [definitions, fallbackActions, configs] = await Promise.all([
      prisma.logDefinition.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          units: { orderBy: { sortOrder: "asc" } },
          items: { where: { active: true }, orderBy: { sortOrder: "asc" } },
          correctiveActionOptions: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.correctiveActionOption.findMany({
        where: { logDefinitionId: null },
        orderBy: { sortOrder: "asc" },
      }),
      locationId ? prisma.locationLogKind.findMany({ where: { locationId } }) : Promise.resolve([]),
    ]);

    const configByDefId = new Map(configs.map((c) => [c.logDefinitionId, c]));

    const logs = definitions
      .filter((def) => !locationId || (configByDefId.get(def.id)?.enabled ?? true))
      .map((def) => {
        const config = configByDefId.get(def.id);
        return {
          id: def.id,
          name: config?.displayLabel ?? def.name,
          formCode: config?.formReference ?? def.formCode,
          kind: def.kind,
          unit: def.unit,
          slots: def.slots,
          revision: def.revision,
          units: def.units,
          items: def.items,
          correctiveActions: def.correctiveActionOptions.length
            ? def.correctiveActionOptions.map((o) => o.text)
            : fallbackActions.map((o) => o.text),
        };
      })
      .sort((a, b) => (configByDefId.get(a.id)?.sortOrder ?? 0) - (configByDefId.get(b.id)?.sortOrder ?? 0));

    return NextResponse.json({ logs });
  } catch (err) {
    return handleApiError(err);
  }
}

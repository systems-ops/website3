import { prisma } from "@/lib/prisma";

export type EffectiveLogDefinition = {
  id: string;
  name: string;
  formCode: string;
  kind: string;
  unit: "F" | "C" | null;
  slots: string[] | null;
  revision: number;
};

// A location's config row is the source of truth once one exists; a form
// with no row at all for a given location is treated as enabled, so a form
// added to LOGS after a location's rows were seeded doesn't silently
// disappear there until someone deliberately turns it off.
export async function getEnabledLogDefinitions(locationId: string): Promise<EffectiveLogDefinition[]> {
  const [definitions, configs] = await Promise.all([
    prisma.logDefinition.findMany({ where: { active: true } }),
    prisma.locationLogKind.findMany({ where: { locationId } }),
  ]);

  const configByDefId = new Map(configs.map((c) => [c.logDefinitionId, c]));

  return definitions
    .filter((d) => configByDefId.get(d.id)?.enabled ?? true)
    .map((d) => {
      const config = configByDefId.get(d.id);
      return {
        id: d.id,
        name: config?.displayLabel ?? d.name,
        formCode: config?.formReference ?? d.formCode,
        kind: d.kind,
        unit: d.unit as "F" | "C" | null,
        slots: Array.isArray(d.slots) ? (d.slots as string[]) : null,
        revision: d.revision,
      };
    })
    .sort((a, b) => (configByDefId.get(a.id)?.sortOrder ?? 0) - (configByDefId.get(b.id)?.sortOrder ?? 0));
}

// Whether a specific form is currently enabled at a location — used to
// reject a submission for a form that's been turned off there, so disabling
// a form isn't just a UI-level hide with nothing enforcing it server-side.
export async function isLogKindEnabledAt(locationId: string, logDefinitionId: string): Promise<boolean> {
  const config = await prisma.locationLogKind.findUnique({
    where: { locationId_logDefinitionId: { locationId, logDefinitionId } },
  });
  return config?.enabled ?? true;
}

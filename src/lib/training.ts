import { prisma } from "@/lib/prisma";

// Empty applicableLocationIds means "every location" — most reference
// material (steps of service, conduct standards) isn't site-specific, and
// item 0's shared-SOP note means authoring once should be the easy path.
export async function listTrainingResources(params: { locationId: string; includeInactive?: boolean }) {
  return prisma.trainingResource.findMany({
    where: {
      ...(params.includeInactive ? {} : { active: true }),
      OR: [{ applicableLocationIds: { isEmpty: true } }, { applicableLocationIds: { has: params.locationId } }],
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

// Powers the "collapsed, one tap" inline surfacing on a form: resources
// linked to the form itself (logItemId null on the link) and resources
// linked to any of the specific items on it.
export async function getTrainingContext(params: { logDefinitionId: string; logItemIds: string[] }) {
  const links = await prisma.trainingResourceLink.findMany({
    where: {
      logDefinitionId: params.logDefinitionId,
      OR: [{ logItemId: null }, { logItemId: { in: params.logItemIds } }],
      trainingResource: { active: true },
    },
    include: { trainingResource: true },
  });

  const formLevel = links.filter((l) => !l.logItemId).map((l) => l.trainingResource);
  const byItemId: Record<string, (typeof links)[number]["trainingResource"][]> = {};
  for (const link of links) {
    if (!link.logItemId) continue;
    (byItemId[link.logItemId] ??= []).push(link.trainingResource);
  }

  return { formLevel, byItemId };
}

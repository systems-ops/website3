import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-errors";
import type { Signer } from "@/lib/signer";

// Claim/complete both upsert the same SideworkCompletion row — unlike
// LogEntry, this is allowed to mutate (see schema.prisma), since none of it
// is evidentiary and it resets every business date anyway.
export async function setSideworkStatus(params: {
  taskId: string;
  locationId: string;
  businessDate: string;
  status: "CLAIMED" | "DONE";
  signer: Signer;
}) {
  const task = await prisma.sideworkTask.findUnique({ where: { id: params.taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  if (!task.locationIds.includes(params.locationId)) {
    throw new ApiError(400, "This task doesn't apply to this kitchen");
  }

  const signatureName =
    params.signer.kind === "manager" ? `${params.signer.name} (${params.signer.role})` : params.signer.name;

  const data =
    params.status === "CLAIMED"
      ? { claimedBy: params.signer.id, claimedSignatureName: signatureName, claimedAt: new Date() }
      : { completedBy: params.signer.id, completedSignatureName: signatureName, completedAt: new Date() };

  return prisma.sideworkCompletion.upsert({
    where: {
      sideworkTaskId_locationId_businessDate: {
        sideworkTaskId: params.taskId,
        locationId: params.locationId,
        businessDate: params.businessDate,
      },
    },
    update: { status: params.status, ...data },
    create: {
      sideworkTaskId: params.taskId,
      locationId: params.locationId,
      businessDate: params.businessDate,
      status: params.status,
      ...data,
    },
  });
}

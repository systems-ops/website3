import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-errors";
import type { Signer } from "@/lib/signer";

function signatureNameFor(signer: Signer): string {
  return signer.kind === "manager" ? `${signer.name} (${signer.role})` : signer.name;
}

// "We are about to run out" as a boolean with a timestamp, not a count — see
// schema.prisma for why. Three cooks flagging the same product on the same
// day is one open flag, not three: a second raise while one is already open
// bumps raiseCount on the existing row instead of creating a duplicate, but
// the repeat is recorded, not silently dropped.
export async function raiseLowStockFlag(params: {
  productId: string;
  locationId: string;
  note?: string;
  signer: Signer;
}) {
  const product = await prisma.product.findUnique({ where: { id: params.productId } });
  if (!product || product.locationId !== params.locationId) {
    throw new ApiError(404, "Product not found at this kitchen");
  }

  const existing = await prisma.lowStockFlag.findFirst({
    where: { productId: params.productId, status: "OPEN" },
  });

  if (existing) {
    return prisma.lowStockFlag.update({
      where: { id: existing.id },
      data: {
        raiseCount: { increment: 1 },
        note: params.note ?? existing.note,
      },
    });
  }

  return prisma.lowStockFlag.create({
    data: {
      productId: params.productId,
      locationId: params.locationId,
      raisedBy: params.signer.id,
      raisedSignatureName: signatureNameFor(params.signer),
      note: params.note,
    },
  });
}

// Clears only on a manager's say-so — ordered or received — never on a
// timer, because a flag that's stayed open for days is itself the signal.
export async function clearLowStockFlag(params: {
  flagId: string;
  disposition: "ordered" | "received";
  manager: Signer & { kind: "manager" };
}) {
  const flag = await prisma.lowStockFlag.findUnique({ where: { id: params.flagId } });
  if (!flag) throw new ApiError(404, "Flag not found");
  if (flag.status !== "OPEN") throw new ApiError(400, "This flag is already cleared");

  return prisma.lowStockFlag.update({
    where: { id: params.flagId },
    data: {
      status: "CLEARED",
      clearedDisposition: params.disposition,
      clearedAt: new Date(),
      clearedBy: params.manager.id,
      clearedSignatureName: signatureNameFor(params.manager),
    },
  });
}

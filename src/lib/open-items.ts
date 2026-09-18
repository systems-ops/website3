import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-errors";
import type { Signer } from "@/lib/signer";

function signatureNameFor(signer: Signer): string {
  return signer.kind === "manager" ? `${signer.name} (${signer.role})` : signer.name;
}

// Calendar-date arithmetic on the "YYYY-MM-DD" string, not a timezone-aware
// instant — same convention as audit-pack.ts/verification.ts elsewhere in
// this codebase, which avoids DST-boundary surprises entirely by never
// touching local time.
function addDays(dateStr: string, days: number): string {
  const dt = new Date(`${dateStr}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

// The prep-label flow: one tap records an open/prepped item. The use-by is
// computed from the product's shelf-life rule when one exists; when it
// doesn't, the caller must supply an explicit use-by date. Product name and
// supplier lot are snapshotted onto the row per invariant 2, so a later
// amendment to the receiving record this links back to never rewrites what
// was true on the shelf.
export async function createOpenItem(params: {
  locationId: string;
  productId: string;
  receivingLineId?: string;
  sourceText?: string;
  openedDate: string;
  useByDate?: string;
  storageLocation?: string;
  signer: Signer;
}) {
  const product = await prisma.product.findUnique({ where: { id: params.productId } });
  if (!product || product.locationId !== params.locationId) {
    throw new ApiError(404, "Product not found at this kitchen");
  }

  let supplierLotSnapshot: string | null = null;
  if (params.receivingLineId) {
    const line = await prisma.receivingLine.findUnique({ where: { id: params.receivingLineId } });
    if (!line) throw new ApiError(404, "Receiving line not found");
    supplierLotSnapshot = line.lotNumber;
  }

  const useByDate = params.useByDate ?? (product.shelfLifeDays != null ? addDays(params.openedDate, product.shelfLifeDays) : null);
  if (!useByDate) {
    throw new ApiError(400, "This product has no shelf-life rule set — supply a use-by date");
  }

  return prisma.openItem.create({
    data: {
      locationId: params.locationId,
      productId: params.productId,
      productNameSnapshot: product.name,
      receivingLineId: params.receivingLineId,
      supplierLotSnapshot,
      sourceText: params.sourceText,
      openedDate: params.openedDate,
      useByDate,
      storageLocation: params.storageLocation,
      openedBy: params.signer.id,
      openedSignatureName: signatureNameFor(params.signer),
    },
  });
}

export async function discardOpenItem(params: { itemId: string; reason: string; signer: Signer }) {
  const item = await prisma.openItem.findUnique({ where: { id: params.itemId } });
  if (!item) throw new ApiError(404, "Item not found");
  if (params.signer.kind === "cook" && !params.signer.locationIds.includes(item.locationId)) {
    throw new ApiError(403, "Not scoped to this kitchen");
  }
  if (item.disposition !== "ON_HAND") throw new ApiError(400, "This item is already discarded");

  return prisma.openItem.update({
    where: { id: params.itemId },
    data: {
      disposition: "DISCARDED",
      discardedAt: new Date(),
      discardedBy: params.signer.id,
      discardedSignatureName: signatureNameFor(params.signer),
      discardReason: params.reason,
    },
  });
}

import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export type TraceBatch = {
  id: string;
  batchCode: string;
  productType: string;
  quantity: string | null;
  businessDate: string;
  location: string;
  signatureName: string;
  producedAt: string;
  inputs: {
    productNameSnapshot: string;
    supplierLotNumber: string | null;
    distributorName: string;
    invoiceNumber: string;
    receivedDate: string;
  }[];
  outputs: {
    productName: string;
    quantity: string | null;
    bakeDate: string;
    bestByDate: string | null;
    disposition: string;
    reference: string | null;
  }[];
};

// A single free-text search across everything a mock recall would start
// from: our own batch code, a supplier's lot number, or a product name —
// the reader doesn't necessarily know which kind of identifier they have.
export async function traceSearch(query: string, locationId?: string): Promise<TraceBatch[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const batches = await prisma.productionBatch.findMany({
    where: {
      ...(locationId ? { locationId } : {}),
      OR: [
        { batchCode: { contains: trimmed, mode: "insensitive" } },
        { productType: { contains: trimmed, mode: "insensitive" } },
        { outputs: { some: { productName: { contains: trimmed, mode: "insensitive" } } } },
        { inputs: { some: { supplierLotNumber: { contains: trimmed, mode: "insensitive" } } } },
      ],
    },
    include: {
      location: true,
      inputs: { include: { receivingLine: { include: { receivingDetail: { include: { logEntry: true } } } } } },
      outputs: true,
    },
    orderBy: { producedAt: "desc" },
  });

  return batches.map((b) => ({
    id: b.id,
    batchCode: b.batchCode,
    productType: b.productType,
    quantity: b.quantity,
    businessDate: b.businessDate,
    location: b.location.name,
    signatureName: b.signatureName,
    producedAt: b.producedAt.toISOString(),
    inputs: b.inputs.map((i) => ({
      productNameSnapshot: i.productNameSnapshot,
      supplierLotNumber: i.supplierLotNumber,
      distributorName: i.receivingLine.receivingDetail.distributorName,
      invoiceNumber: i.receivingLine.receivingDetail.invoiceNumber,
      receivedDate: i.receivingLine.receivingDetail.logEntry.businessDate,
    })),
    outputs: b.outputs.map((o) => ({
      productName: o.productName,
      quantity: o.quantity,
      bakeDate: o.bakeDate,
      bestByDate: o.bestByDate,
      disposition: o.disposition,
      reference: o.reference,
    })),
  }));
}

// Recently received lots for a location, for the batch-entry chip picker —
// the common case should be tapping two or three things, not typing lot
// numbers.
export async function recentReceivedLots(locationId: string, days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const lines = await prisma.receivingLine.findMany({
    where: {
      receivingDetail: { logEntry: { locationId, businessDate: { gte: since }, amendsId: null } },
    },
    include: { receivingDetail: { include: { logEntry: true } } },
    orderBy: { id: "desc" },
    take: 100,
  });
  return lines.map((l) => ({
    receivingLineId: l.id,
    productName: l.productName,
    lotNumber: l.lotNumber,
    distributorName: l.receivingDetail.distributorName,
    receivedDate: l.receivingDetail.logEntry.businessDate,
  }));
}

// A mock recall walks a batch code, lot number, or product name to every
// input it was made from and every output it became — this is that walk,
// flattened one row per input/output pair for CSV/PDF.
function traceRows(batches: TraceBatch[]): string[][] {
  const rows: string[][] = [];
  for (const b of batches) {
    const inputs = b.inputs.length ? b.inputs : [null];
    const outputs = b.outputs.length ? b.outputs : [null];
    for (const i of inputs) {
      for (const o of outputs) {
        rows.push([
          b.batchCode,
          b.location,
          b.businessDate,
          b.productType,
          b.quantity ?? "",
          b.signatureName,
          i ? i.productNameSnapshot : "",
          i ? i.supplierLotNumber ?? "" : "",
          i ? i.distributorName : "",
          i ? i.invoiceNumber : "",
          i ? i.receivedDate : "",
          o ? o.productName : "",
          o ? o.quantity ?? "" : "",
          o ? o.bakeDate : "",
          o ? o.bestByDate ?? "" : "",
          o ? o.disposition : "",
          o ? o.reference ?? "" : "",
        ]);
      }
    }
  }
  return rows;
}

const TRACE_HEADERS = [
  "batch_code",
  "location",
  "business_date",
  "product_type",
  "quantity",
  "signed_by",
  "input_product",
  "input_lot_number",
  "input_distributor",
  "input_invoice_number",
  "input_received_date",
  "output_product",
  "output_quantity",
  "output_bake_date",
  "output_best_by_date",
  "output_disposition",
  "output_reference",
];

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function traceToCsv(batches: TraceBatch[]): string {
  const lines = [TRACE_HEADERS.join(",")];
  for (const row of traceRows(batches)) {
    lines.push(row.map(csvCell).join(","));
  }
  return lines.join("\n");
}

export function traceToPdf(batches: TraceBatch[], title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "letter" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text(title, { align: "left" });
    doc.moveDown(0.5);

    if (batches.length === 0) {
      doc.fontSize(11).text("No matching batches.");
      doc.end();
      return;
    }

    for (const b of batches) {
      doc.moveDown(0.75);
      doc
        .fontSize(13)
        .text(`${b.batchCode} — ${b.productType} — ${b.location} — ${b.businessDate}`, { underline: true });
      doc.fontSize(10).text(`Signed by ${b.signatureName}`);
      doc.moveDown(0.25);

      doc.fontSize(10).text("Inputs:");
      for (const i of b.inputs) {
        doc
          .fontSize(9)
          .text(
            `  ${i.productNameSnapshot} — lot ${i.supplierLotNumber ?? "n/a"} — ${i.distributorName}, invoice ${i.invoiceNumber}, received ${i.receivedDate}`
          );
      }
      if (!b.inputs.length) doc.fontSize(9).text("  (none recorded)");

      doc.moveDown(0.15);
      doc.fontSize(10).text("Outputs:");
      for (const o of b.outputs) {
        doc
          .fontSize(9)
          .text(
            `  ${o.productName} — qty ${o.quantity ?? "n/a"} — baked ${o.bakeDate}${o.bestByDate ? `, best by ${o.bestByDate}` : ""} — ${o.disposition}${o.reference ? ` (${o.reference})` : ""}`
          );
      }
      if (!b.outputs.length) doc.fontSize(9).text("  (none recorded)");
    }

    doc.end();
  });
}

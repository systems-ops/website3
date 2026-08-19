import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export type ExportRow = {
  businessDate: string;
  location: string;
  formCode: string;
  formName: string;
  kind: string;
  signedBy: string;
  submittedAt: string;
  amended: boolean;
  item: string;
  slotOrStatus: string;
  value: string;
  outOfSpec: string;
  correctiveAction: string;
};

// Flattens submitted records (one row per reading or checked item) into a
// single tabular shape shared by the CSV and PDF export, so an auditor gets
// the same data either way — just a different container.
export async function buildExportRows(params: {
  locationId: string;
  logDefinitionId?: string;
  from?: string;
  to?: string;
}): Promise<ExportRow[]> {
  const where: Record<string, unknown> = { locationId: params.locationId, amendsId: null };
  if (params.logDefinitionId) where.logDefinitionId = params.logDefinitionId;
  if (params.from || params.to) {
    where.businessDate = {
      ...(params.from ? { gte: params.from } : {}),
      ...(params.to ? { lte: params.to } : {}),
    };
  }

  const entries = await prisma.logEntry.findMany({
    where,
    orderBy: { businessDate: "asc" },
    include: {
      location: true,
      logDefinition: true,
      readings: { include: { logUnit: true }, orderBy: { slotIndex: "asc" } },
      itemChecks: { include: { logItem: true } },
      amendments: {
        include: {
          logDefinition: true,
          readings: { include: { logUnit: true }, orderBy: { slotIndex: "asc" } },
          itemChecks: { include: { logItem: true } },
        },
      },
    },
  });

  const rows: ExportRow[] = [];

  for (const original of entries) {
    // Amendments supersede the original for export purposes, but the
    // original row still appears (marked) so the audit trail is visible —
    // an auditor should see both what was first recorded and the correction.
    const versions = [
      { entry: original, amended: original.amendments.length > 0 },
      ...original.amendments.map((a) => ({ entry: a, amended: false })),
    ];

    for (const { entry, amended } of versions) {
      const slots = Array.isArray(entry.logDefinition.slots)
        ? (entry.logDefinition.slots as string[])
        : [];
      const base = {
        businessDate: entry.businessDate,
        location: original.location.name,
        formCode: entry.logDefinition.formCode,
        formName: entry.logDefinition.name,
        kind: entry.logDefinition.kind,
        signedBy: entry.signatureName,
        submittedAt: entry.submittedAt.toISOString(),
        amended,
      };

      if (entry.logDefinition.kind === "temps") {
        for (const r of entry.readings) {
          const unitLabel = entry.logDefinition.unit ? `°${entry.logDefinition.unit}` : "";
          rows.push({
            ...base,
            item: r.logUnit.name,
            slotOrStatus: slots[r.slotIndex] ?? String(r.slotIndex),
            value: `${r.value}${r.specUnitOverride ?? unitLabel}`,
            outOfSpec: r.outOfSpec ? "yes" : "no",
            correctiveAction: r.correctiveAction ?? "",
          });
        }
      } else {
        for (const c of entry.itemChecks) {
          rows.push({
            ...base,
            item: c.logItem.label,
            slotOrStatus: c.checked ? "checked" : "unchecked",
            value: "",
            outOfSpec: "",
            correctiveAction: "",
          });
        }
      }
    }
  }

  return rows;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function rowsToCsv(rows: ExportRow[]): string {
  const headers = [
    "business_date",
    "location",
    "form_code",
    "form_name",
    "kind",
    "signed_by",
    "submitted_at",
    "amended",
    "item",
    "slot_or_status",
    "value",
    "out_of_spec",
    "corrective_action",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.businessDate,
        r.location,
        r.formCode,
        r.formName,
        r.kind,
        r.signedBy,
        r.submittedAt,
        r.amended ? "amended" : "",
        r.item,
        r.slotOrStatus,
        r.value,
        r.outOfSpec,
        r.correctiveAction,
      ]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
  }
  return lines.join("\n");
}

// One line per row, grouped visually by business date — enough structure for
// an auditor to scan without trying to reproduce the CSV as a table.
export function rowsToPdf(rows: ExportRow[], title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "letter" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text(title, { align: "left" });
    doc.moveDown(0.5);

    if (rows.length === 0) {
      doc.fontSize(11).text("No records in range.");
      doc.end();
      return;
    }

    let lastDate = "";
    for (const r of rows) {
      if (r.businessDate !== lastDate) {
        lastDate = r.businessDate;
        doc.moveDown(0.75);
        doc.fontSize(13).text(`${r.businessDate} — ${r.location}`, { underline: true });
        doc.moveDown(0.25);
      }
      const parts = [`${r.formCode} ${r.formName}`, r.item];
      if (r.slotOrStatus) parts.push(r.slotOrStatus);
      if (r.value) parts.push(r.value);
      if (r.outOfSpec === "yes") parts.push("OUT OF SPEC");
      if (r.correctiveAction) parts.push(`corrective action: ${r.correctiveAction}`);
      parts.push(`signed: ${r.signedBy}`);
      if (r.amended) parts.push("(amended)");
      doc.fontSize(10).text(parts.join("  ·  "));
    }

    doc.end();
  });
}

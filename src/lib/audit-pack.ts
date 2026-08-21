import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { buildExportRows, rowsToCsv, type ExportRow } from "@/lib/export";
import { computeWeekSummary, mondayOf, type WeekSummary } from "@/lib/verification";
import { todayBusinessDate } from "@/lib/business-date";

const COMPANY_NAME = "Passione Brands";

// A wide range can span many weeks — every Monday whose week overlaps
// [from, to], inclusive at both ends.
function mondaysInRange(from: string, to: string): string[] {
  const mondays: string[] = [];
  let cursor = mondayOf(from);
  const last = mondayOf(to);
  while (cursor <= last) {
    mondays.push(cursor);
    const [y, m, d] = cursor.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + 7);
    cursor = dt.toISOString().slice(0, 10);
  }
  return mondays;
}

function datesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const [fy, fm, fd] = from.split("-").map(Number);
  const cursor = new Date(Date.UTC(fy, fm - 1, fd));
  const [ty, tm, td] = to.split("-").map(Number);
  const end = new Date(Date.UTC(ty, tm - 1, td));
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export type CompletenessRow = {
  formCode: string;
  formName: string;
  requiredDays: number;
  missingDays: string[];
};

export type LateEntry = { businessDate: string; formCode: string; formName: string; signedBy: string; lateReason: string };
export type AmendmentEntry = { businessDate: string; formCode: string; formName: string; signedBy: string; amendReason: string };

export type AuditPack = {
  companyName: string;
  locationName: string;
  from: string;
  to: string;
  generatedAt: string;
  generatedBy: string;
  completeness: CompletenessRow[];
  exceptions: ExportRow[];
  lateEntries: LateEntry[];
  amendments: AmendmentEntry[];
  weeks: WeekSummary[];
  rows: ExportRow[];
};

// Everything a manager needs to hand to an auditor for one kitchen over one
// date range, built on the same flattened rows /api/export produces — this
// deliberately does not re-derive out-of-spec/corrective-action logic, it
// just groups and summarizes what buildExportRows already computed.
export async function buildAuditPack(params: {
  locationId: string;
  from: string;
  to: string;
  generatedBy: string;
}): Promise<AuditPack> {
  const { locationId, from, to, generatedBy } = params;

  const [location, definitions, rows, weeks] = await Promise.all([
    prisma.location.findUniqueOrThrow({ where: { id: locationId } }),
    prisma.logDefinition.findMany({ where: { active: true } }),
    buildExportRows({ locationId, from, to }),
    Promise.all(mondaysInRange(from, to).map((weekStart) => computeWeekSummary(locationId, weekStart))),
  ]);

  const days = datesInRange(from, to);
  const today = todayBusinessDate();

  // Presence per form, derived from the same rows the CSV/PDF detail use —
  // any row for a form on a day means that form wasn't missing that day.
  const presentByForm = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!presentByForm.has(r.formCode)) presentByForm.set(r.formCode, new Set());
    presentByForm.get(r.formCode)!.add(r.businessDate);
  }

  const completeness: CompletenessRow[] = definitions
    .filter((d) => d.kind !== "receiving")
    .map((d) => {
      const present = presentByForm.get(d.formCode) ?? new Set();
      const missingDays = days.filter((day) => day <= today && !present.has(day));
      return { formCode: d.formCode, formName: d.name, requiredDays: days.filter((day) => day <= today).length, missingDays };
    })
    .filter((c) => c.missingDays.length > 0);

  const exceptions = rows.filter((r) => r.outOfSpec === "yes");

  const seenEntries = new Set<string>();
  const lateEntries: LateEntry[] = [];
  const amendments: AmendmentEntry[] = [];
  for (const r of rows) {
    const entryKey = `${r.formCode}|${r.businessDate}|${r.submittedAt}|${r.signedBy}`;
    if (seenEntries.has(entryKey)) continue;
    seenEntries.add(entryKey);
    if (r.daysLate) {
      lateEntries.push({ businessDate: r.businessDate, formCode: r.formCode, formName: r.formName, signedBy: r.signedBy, lateReason: r.daysLate });
    }
    if (r.amendReason) {
      amendments.push({ businessDate: r.businessDate, formCode: r.formCode, formName: r.formName, signedBy: r.signedBy, amendReason: r.amendReason });
    }
  }

  return {
    companyName: COMPANY_NAME,
    locationName: location.name,
    from,
    to,
    generatedAt: new Date().toISOString(),
    generatedBy,
    completeness,
    exceptions,
    lateEntries,
    amendments,
    weeks,
    rows,
  };
}

export function auditPackToCsv(pack: AuditPack): string {
  return rowsToCsv(pack.rows);
}

export function auditPackToPdf(pack: AuditPack): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "letter" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cover page
    doc.fontSize(22).text(pack.companyName, { align: "left" });
    doc.fontSize(16).text("Compliance Audit Pack");
    doc.moveDown(1);
    doc.fontSize(12).text(`Location: ${pack.locationName}`);
    doc.text(`Date range: ${pack.from} to ${pack.to}`);
    doc.text(`Generated by: ${pack.generatedBy}`);
    doc.text(`Generated at: ${pack.generatedAt}`);

    // Completeness summary
    doc.addPage();
    doc.fontSize(16).text("Completeness summary");
    doc.moveDown(0.5);
    if (pack.completeness.length === 0) {
      doc.fontSize(11).text("No missing days for any required form in this range.");
    } else {
      for (const c of pack.completeness) {
        doc.fontSize(11).text(`${c.formCode} ${c.formName} — ${c.missingDays.length} of ${c.requiredDays} days missing`);
        doc.fontSize(9).text(`  Missing: ${c.missingDays.join(", ")}`);
        doc.moveDown(0.3);
      }
    }

    // Exceptions summary, grouped by form
    doc.addPage();
    doc.fontSize(16).text("Exceptions summary");
    doc.moveDown(0.5);
    if (pack.exceptions.length === 0) {
      doc.fontSize(11).text("No out-of-spec readings or failed checklist items in this range.");
    } else {
      let lastForm = "";
      for (const e of pack.exceptions) {
        const formKey = `${e.formCode} ${e.formName}`;
        if (formKey !== lastForm) {
          lastForm = formKey;
          doc.moveDown(0.4);
          doc.fontSize(13).text(formKey, { underline: true });
        }
        doc.fontSize(10).text(
          `${e.businessDate} — ${e.item}${e.slotOrStatus ? ` (${e.slotOrStatus})` : ""}${e.value ? `: ${e.value}` : ""} — corrective action: ${e.correctiveAction || "none recorded"} — signed: ${e.signedBy}`
        );
      }
    }

    // Late entries
    doc.addPage();
    doc.fontSize(16).text("Late entries");
    doc.moveDown(0.5);
    if (pack.lateEntries.length === 0) {
      doc.fontSize(11).text("No entries were submitted late in this range.");
    } else {
      for (const l of pack.lateEntries) {
        doc.fontSize(10).text(`${l.businessDate} — ${l.formCode} ${l.formName} — signed: ${l.signedBy} — ${l.lateReason}`);
      }
    }

    // Amendments
    doc.addPage();
    doc.fontSize(16).text("Amendments");
    doc.moveDown(0.5);
    if (pack.amendments.length === 0) {
      doc.fontSize(11).text("No amendments were made to records in this range.");
    } else {
      for (const a of pack.amendments) {
        doc.fontSize(10).text(`${a.businessDate} — ${a.formCode} ${a.formName} — approved by: ${a.signedBy} — reason: ${a.amendReason}`);
      }
    }

    // Weekly manager verification
    doc.addPage();
    doc.fontSize(16).text("Weekly manager verification");
    doc.moveDown(0.5);
    if (pack.weeks.length === 0) {
      doc.fontSize(11).text("No weeks in this range.");
    } else {
      for (const w of pack.weeks) {
        if (w.verification) {
          doc.fontSize(11).text(`Week of ${w.weekStart} — verified by ${w.verification.manager.name} on ${w.verification.verifiedAt.slice(0, 10)}`);
          if (w.verification.comments) doc.fontSize(9).text(`  ${w.verification.comments}`);
        } else {
          doc.fontSize(11).text(
            `Week of ${w.weekStart} — NOT VERIFIED (${w.outOfSpecCount} out of spec, ${w.failedCount} failed, ${w.lateCount} late, ${w.missingByLog.length} forms with missing days)`
          );
        }
      }
    }

    // Full record detail, ordered by form then date
    doc.addPage();
    doc.fontSize(16).text("Full record detail");
    doc.moveDown(0.5);
    const sorted = [...pack.rows].sort((a, b) => a.formCode.localeCompare(b.formCode) || a.businessDate.localeCompare(b.businessDate));
    if (sorted.length === 0) {
      doc.fontSize(11).text("No records in range.");
    } else {
      let lastKey = "";
      for (const r of sorted) {
        const key = `${r.formCode}|${r.businessDate}`;
        if (key !== lastKey) {
          lastKey = key;
          doc.moveDown(0.5);
          doc.fontSize(12).text(`${r.formCode} ${r.formName} — ${r.businessDate}`, { underline: true });
        }
        const parts = [r.item];
        if (r.slotOrStatus) parts.push(r.slotOrStatus);
        if (r.value) parts.push(r.value);
        if (r.outOfSpec === "yes") parts.push("OUT OF SPEC");
        if (r.correctiveAction) parts.push(`corrective action: ${r.correctiveAction}`);
        parts.push(`signed: ${r.signedBy}`);
        if (r.amended) parts.push(`(amended${r.amendReason ? `: ${r.amendReason}` : ""})`);
        doc.fontSize(9).text(parts.join("  ·  "));
      }
    }

    doc.end();
  });
}

import type { DailyReportData } from "@/lib/daily-report";

function appUrl(): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "";
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Lead with exceptions — a report that looks the same on a good day and a
// bad day gets ignored within two weeks. A clean day is one line; detail
// belongs behind a link into the app, not in the body.
export function dailyReportSubject(report: DailyReportData): string {
  const exceptionCount =
    report.outstanding.length + report.compliance.outOfSpec.length + report.compliance.failed.length + report.compliance.late.length + report.compliance.rejectedReceiving.length;
  const headline = report.isClean ? "All clear" : exceptionCount === 1 ? "1 exception" : `${exceptionCount} exceptions`;
  return `${report.location.name} — ${report.businessDate}: ${headline}`;
}

export function dailyReportText(report: DailyReportData): string {
  const lines: string[] = [];
  const link = appUrl() ? `${appUrl()}/kitchen` : null;

  if (report.isClean) {
    lines.push(`${report.location.name}, ${report.businessDate}: everything was completed and nothing was out of spec.`);
  } else {
    lines.push(`${report.location.name} — ${report.businessDate}`);
    lines.push(`${report.completedCount} of ${report.expectedCount} expected forms completed.`);
    lines.push("");
    if (report.outstanding.length > 0) {
      lines.push(`STILL OUTSTANDING (${report.outstanding.length}):`);
      for (const o of report.outstanding) lines.push(`  - ${o.name}`);
      lines.push("");
    }
    if (report.compliance.outOfSpec.length > 0) {
      lines.push(`OUT OF SPEC (${report.compliance.outOfSpec.length}):`);
      for (const r of report.compliance.outOfSpec) {
        lines.push(`  - ${r.formName} — ${r.item}: ${r.value} — corrective action: ${r.correctiveAction || "none recorded"} (${r.signedBy})`);
      }
      lines.push("");
    }
    if (report.compliance.failed.length > 0) {
      lines.push(`CHECKLIST FAILURES (${report.compliance.failed.length}):`);
      for (const f of report.compliance.failed) {
        lines.push(`  - ${f.formName} — ${f.item}: ${f.note || "no note recorded"} (${f.signedBy})`);
      }
      lines.push("");
    }
    if (report.compliance.late.length > 0) {
      lines.push(`LATE ENTRIES (${report.compliance.late.length}):`);
      for (const l of report.compliance.late) lines.push(`  - ${l.formName} — ${l.lateReason} (${l.signedBy})`);
      lines.push("");
    }
    if (report.compliance.rejectedReceiving.length > 0) {
      lines.push(`RECEIVING REJECTED (${report.compliance.rejectedReceiving.length}):`);
      for (const r of report.compliance.rejectedReceiving) lines.push(`  - ${r.reason || "no reason recorded"} (${r.signedBy})`);
      lines.push("");
    }
  }

  if (report.compliance.amendments.length > 0) {
    lines.push(`AMENDMENTS MADE TODAY (${report.compliance.amendments.length}):`);
    for (const a of report.compliance.amendments) lines.push(`  - ${a.formName} — ${a.amendReason} (${a.signedBy})`);
    lines.push("");
  }

  if (report.lowStockFlags.length > 0) {
    lines.push(`RUNNING LOW (${report.lowStockFlags.length}) — flagged today, does not affect compliance:`);
    for (const f of report.lowStockFlags) {
      lines.push(`  - ${f.productName}${f.raiseCount > 1 ? ` (raised ${f.raiseCount}x)` : ""}${f.note ? `: ${f.note}` : ""} (${f.raisedSignatureName})`);
    }
    lines.push("");
  }

  if (report.sideworkTotal > 0) {
    lines.push(`Sidework: ${report.sideworkDone} of ${report.sideworkTotal} tasks done today — operational only, not part of compliance.`);
    lines.push("");
  }

  if (link) lines.push(`Full detail: ${link}`);

  return lines.join("\n");
}

export function dailyReportHtml(report: DailyReportData): string {
  const link = appUrl() ? `${appUrl()}/kitchen` : null;

  if (report.isClean) {
    return `<div style="font-family:sans-serif;font-size:15px;color:#1d1f20;">
      <p><strong>${esc(report.location.name)}, ${esc(report.businessDate)}:</strong> everything was completed and nothing was out of spec.</p>
      ${report.lowStockFlags.length > 0 ? renderLowStockSection(report) : ""}
      ${report.sideworkTotal > 0 ? renderSideworkLine(report) : ""}
      ${link ? `<p><a href="${link}">Open the app</a></p>` : ""}
    </div>`;
  }

  const sections: string[] = [];
  if (report.outstanding.length > 0) {
    sections.push(
      section(
        "Still outstanding",
        report.outstanding.map((o) => esc(o.name))
      )
    );
  }
  if (report.compliance.outOfSpec.length > 0) {
    sections.push(
      section(
        "Out of spec",
        report.compliance.outOfSpec.map(
          (r) => `${esc(r.formName)} — ${esc(r.item)}: ${esc(r.value)} — corrective action: ${esc(r.correctiveAction || "none recorded")} (${esc(r.signedBy)})`
        )
      )
    );
  }
  if (report.compliance.failed.length > 0) {
    sections.push(
      section(
        "Checklist failures",
        report.compliance.failed.map((f) => `${esc(f.formName)} — ${esc(f.item)}: ${esc(f.note || "no note recorded")} (${esc(f.signedBy)})`)
      )
    );
  }
  if (report.compliance.late.length > 0) {
    sections.push(
      section(
        "Late entries",
        report.compliance.late.map((l) => `${esc(l.formName)} — ${esc(l.lateReason)} (${esc(l.signedBy)})`)
      )
    );
  }
  if (report.compliance.rejectedReceiving.length > 0) {
    sections.push(
      section(
        "Receiving rejected",
        report.compliance.rejectedReceiving.map((r) => `${esc(r.reason || "no reason recorded")} (${esc(r.signedBy)})`)
      )
    );
  }
  if (report.compliance.amendments.length > 0) {
    sections.push(
      section(
        "Amendments made today",
        report.compliance.amendments.map((a) => `${esc(a.formName)} — ${esc(a.amendReason)} (${esc(a.signedBy)})`)
      )
    );
  }

  return `<div style="font-family:sans-serif;font-size:15px;color:#1d1f20;max-width:560px;">
    <p><strong>${esc(report.location.name)} — ${esc(report.businessDate)}</strong><br/>
    ${report.completedCount} of ${report.expectedCount} expected forms completed.</p>
    ${sections.join("")}
    ${report.lowStockFlags.length > 0 ? renderLowStockSection(report) : ""}
    ${report.sideworkTotal > 0 ? renderSideworkLine(report) : ""}
    ${link ? `<p><a href="${link}">Open the app for full detail</a></p>` : ""}
  </div>`;
}

function section(title: string, items: string[]): string {
  return `<p style="margin:14px 0 4px;"><strong>${esc(title)} (${items.length})</strong></p>
    <ul style="margin:0;padding-left:18px;">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

function renderLowStockSection(report: DailyReportData): string {
  const items = report.lowStockFlags.map(
    (f) => `${esc(f.productName)}${f.raiseCount > 1 ? ` (raised ${f.raiseCount}x)` : ""}${f.note ? `: ${esc(f.note)}` : ""} (${esc(f.raisedSignatureName)})`
  );
  return `<p style="margin:14px 0 4px;color:#55575c;"><strong>Running low (${items.length})</strong> — flagged today, does not affect compliance</p>
    <ul style="margin:0;padding-left:18px;color:#55575c;">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

function renderSideworkLine(report: DailyReportData): string {
  return `<p style="margin:14px 0 4px;color:#55575c;">Sidework: ${report.sideworkDone} of ${report.sideworkTotal} tasks done today — operational only, not part of compliance.</p>`;
}

"use client";

import type { LogDefinition, LogEntryRecord } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

export default function EntryDetail({
  log,
  entry,
  onClose,
  lang,
}: {
  log: LogDefinition;
  entry: LogEntryRecord;
  onClose: () => void;
  lang: Lang;
}) {
  const t = strings[lang];
  const unitLabel = log.unit ? `°${log.unit}` : "";

  return (
    <div className="kitchen-app" style={{ position: "absolute", inset: 0, background: "var(--color-bg)", display: "flex", flexDirection: "column", zIndex: 70 }}>
      <div style={{ flex: "none", padding: "54px 20px 14px", display: "flex", flexDirection: "column", gap: 6, borderBottom: "1px solid var(--color-divider)" }}>
        <button
          onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, marginLeft: -6, padding: "0 6px", background: "transparent", border: 0, cursor: "pointer", fontSize: 15, color: "var(--color-accent-700)" }}
        >
          <svg width="10" height="17" viewBox="0 0 12 20">
            <path d="M10 2L2 10l8 8" stroke="#3f5f80" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          {t.back}
        </button>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 28, lineHeight: 1.1 }}>{log.name}</span>
        <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{t.writtenDownBy(entry.signatureName)}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {log.kind === "temps" &&
          log.units.map((unit) => {
            const readings = entry.readings.filter((r) => r.logUnitId === unit.id).sort((a, b) => a.slotIndex - b.slotIndex);
            if (!readings.length) return null;
            return (
              <div key={unit.id} className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
                <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19 }}>{unit.name}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {readings.map((r) => (
                    <div key={r.id} style={{ flex: 1, minHeight: 78, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, border: `1px solid ${r.outOfSpec ? "var(--color-alert-border)" : "var(--color-divider)"}` }}>
                      <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{log.slots?.[r.slotIndex]}</span>
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 28, color: r.outOfSpec ? "var(--color-alert)" : "var(--color-text)" }}>
                        {r.value}
                        {r.specUnitOverride ?? unitLabel}
                      </span>
                    </div>
                  ))}
                </div>
                {readings.some((r) => r.correctiveAction) && (
                  <span style={{ fontSize: 13.5, color: "var(--color-alert-text)" }}>
                    {readings
                      .filter((r) => r.correctiveAction)
                      .map((r) => `${log.slots?.[r.slotIndex]}: ${r.correctiveAction}`)
                      .join("  ·  ")}
                  </span>
                )}
              </div>
            );
          })}

        {log.kind === "check" &&
          log.items.map((item) => {
            const check = entry.itemChecks.find((c) => c.logItemId === item.id);
            return (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 66, padding: "10px 14px", border: "1px solid var(--color-divider)" }}>
                <span style={{ width: 26, height: 26, flex: "none", border: "1px solid rgba(29,31,32,.45)", background: check?.checked ? "var(--color-accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {check?.checked && (
                    <svg width="15" height="12" viewBox="0 0 12 10">
                      <path d="M1 5l3.5 3.5L11 1.5" stroke="#f2f2f3" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: 16.5, lineHeight: 1.35, flex: 1 }}>{item.label}</span>
              </div>
            );
          })}

        {log.kind === "calibration" &&
          entry.calibrationRows.map((row) => (
            <div
              key={row.id}
              className="blueprint"
              style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, border: row.adjustmentRequired ? "1px solid var(--color-alert-border)" : undefined }}
            >
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19 }}>{row.testTermId}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{t.referenceReading}</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22 }}>{row.referenceReading}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{t.testReading}</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, color: row.adjustmentRequired ? "var(--color-alert)" : "var(--color-text)" }}>
                    {row.testReading}
                  </span>
                </div>
              </div>
              {row.comments && <span style={{ fontSize: 13.5, color: "var(--color-alert-text)" }}>{row.comments}</span>}
            </div>
          ))}

        <span style={{ fontSize: 12.5, color: "rgba(29,31,32,.4)", paddingTop: 4 }}>{log.formCode}</span>
      </div>
    </div>
  );
}

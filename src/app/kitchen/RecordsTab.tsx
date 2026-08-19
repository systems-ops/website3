"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchLogEntriesByMonth } from "./api-client";
import type { CertificateStatus, LogDefinition, LogEntryRecord } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

function monthKey(offset: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - offset);
  return { y: d.getFullYear(), m: d.getMonth(), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function RecordsTab({
  locationId,
  logs,
  certificates,
  lang,
}: {
  locationId: string;
  logs: LogDefinition[];
  certificates: CertificateStatus[];
  lang: Lang;
}) {
  const t = strings[lang];
  const tempsLogs = useMemo(() => logs.filter((l) => l.kind === "temps"), [logs]);
  const [hLogId, setHLogId] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());
  const [entries, setEntries] = useState<LogEntryRecord[]>([]);

  const { y, m, key } = monthKey(monthOffset);
  const today = new Date();
  const isCurrentMonth = monthOffset === 0;
  const effectiveHLogId = tempsLogs.some((l) => l.id === hLogId) ? hLogId : (tempsLogs[0]?.id ?? "");

  function pickLog(id: string) {
    setHLogId(id);
  }

  function monthOlder() {
    setMonthOffset((o) => Math.min(23, o + 1));
    setSelectedDay(null);
  }

  function monthNewer() {
    setMonthOffset((o) => {
      const next = Math.max(0, o - 1);
      setSelectedDay(next === 0 ? today.getDate() : null);
      return next;
    });
  }

  useEffect(() => {
    if (!effectiveHLogId) return;
    fetchLogEntriesByMonth(locationId, effectiveHLogId, key)
      .then((r) => setEntries(r.entries))
      .catch(() => setEntries([]));
  }, [locationId, effectiveHLogId, key]);

  const entriesByDay = useMemo(() => {
    const map = new Map<number, LogEntryRecord>();
    for (const e of entries) {
      const day = Number(e.businessDate.slice(8, 10));
      map.set(day, e);
    }
    return map;
  }, [entries]);

  const hLog = tempsLogs.find((l) => l.id === effectiveHLogId);
  const nDays = daysInMonth(y, m);
  const monthLabel = `${MONTH_NAMES[m]} ${y}`;
  const selectedEntry = selectedDay ? entriesByDay.get(selectedDay) : undefined;

  function exportUrl(format: "csv" | "pdf") {
    const from = `${key}-01`;
    const to = `${key}-${String(nDays).padStart(2, "0")}`;
    const p = new URLSearchParams({ locationId, from, to, format });
    if (effectiveHLogId) p.set("logDefinitionId", effectiveHLogId);
    return `/api/export?${p.toString()}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.certificates}</span>
        {certificates.map((c) => (
          <div
            key={c.id}
            style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderBottom: "1px solid var(--color-divider)" }}
          >
            <span style={{ width: 14, height: 14, flex: "none", background: c.ok ? "var(--color-accent)" : "var(--color-alert)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, lineHeight: 1.2, flex: 1 }}>{c.name}</span>
            <span style={{ fontSize: 13.5, textAlign: "right", color: c.ok ? "var(--color-muted)" : "var(--color-alert)" }}>{c.status}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.pastMonths}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tempsLogs.map((l) => (
            <button
              key={l.id}
              onClick={() => pickLog(l.id)}
              style={{
                minHeight: 52,
                padding: "8px 14px",
                background: l.id === effectiveHLogId ? "var(--color-accent)" : "transparent",
                color: l.id === effectiveHLogId ? "#f2f2f3" : "var(--color-text)",
                border: "1px solid var(--color-divider)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 17,
              }}
            >
              {l.name}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
          <button className="btn btn-secondary" onClick={monthOlder} style={{ minWidth: 52, minHeight: 48, fontSize: 17 }}>
            ‹
          </button>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 21, flex: 1, textAlign: "center" }}>{monthLabel}</span>
          <button className="btn btn-secondary" onClick={monthNewer} style={{ minWidth: 52, minHeight: 48, fontSize: 17 }}>
            ›
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {Array.from({ length: nDays }, (_, k) => {
            const day = k + 1;
            const future = isCurrentMonth && day > today.getDate();
            const entry = entriesByDay.get(day);
            const over = entry?.readings.some((r) => r.outOfSpec);
            const bg = future || !entry ? "transparent" : over ? "var(--color-alert)" : "var(--color-accent)";
            const fg = future || !entry ? "rgba(29,31,32,.35)" : "#f2f2f3";
            const border = day === selectedDay ? "#1d1f20" : future || !entry ? "rgba(29,31,32,.3)" : "transparent";
            return (
              <button
                key={day}
                disabled={future}
                onClick={() => setSelectedDay(day)}
                style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: fg, border: `1px solid ${border}`, cursor: future ? "default" : "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 16, paddingTop: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-muted)" }}>
            <span style={{ width: 11, height: 11, background: "var(--color-accent)" }} />
            {t.allFine}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-muted)" }}>
            <span style={{ width: 11, height: 11, background: "var(--color-alert)" }} />
            {t.outOfRange}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-muted)" }}>
            <span style={{ width: 11, height: 11, border: "1px solid rgba(29,31,32,.3)" }} />
            {t.nothingYet}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.exportData}</span>
          <span style={{ fontSize: 12.5, color: "var(--color-muted)" }}>
            {t.exportThisMonth(hLog?.name ?? "")}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              className="btn btn-secondary"
              style={{ flex: 1, textAlign: "center", minHeight: 48, lineHeight: "48px" }}
              href={exportUrl("csv")}
            >
              {t.exportCsv}
            </a>
            <a
              className="btn btn-secondary"
              style={{ flex: 1, textAlign: "center", minHeight: 48, lineHeight: "48px" }}
              href={exportUrl("pdf")}
            >
              {t.exportPdf}
            </a>
          </div>
        </div>

        <div className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 14px" }}>
          <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19 }}>
            {selectedDay} {monthLabel.split(" ")[0]}
          </span>
          {selectedEntry ? (
            <>
              {hLog?.units.map((unit) => {
                const readings = selectedEntry.readings
                  .filter((r) => r.logUnitId === unit.id)
                  .sort((a, b) => a.slotIndex - b.slotIndex);
                if (!readings.length) return null;
                const over = readings.some((r) => r.outOfSpec);
                const suffix = readings[0].specUnitOverride ?? (hLog.unit ? `°${hLog.unit}` : "");
                return (
                  <div key={unit.id} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{unit.name}</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, color: over ? "var(--color-alert)" : "var(--color-text)" }}>
                      {readings.map((r) => r.value).join("  ·  ")} {suffix}
                    </span>
                  </div>
                );
              })}
              <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>
                {t.writtenDownBy(selectedEntry.signatureName)}
                {selectedEntry.readings.some((r) => r.correctiveAction) &&
                  " · " + selectedEntry.readings.find((r) => r.correctiveAction)?.correctiveAction}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{t.nothingRecorded}</span>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchOpenItems } from "./api-client";
import type { LogKind, OpenItemRecord, TodayResponse } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";
import { CalibrationIcon, ChecklistIcon, ChevronRightIcon, TempsIcon, TruckIcon } from "./icons";
import { addDaysToBusinessDate } from "@/lib/business-date";

const KIND_ICON: Record<LogKind, (props: { size?: number }) => React.JSX.Element> = {
  temps: TempsIcon,
  check: ChecklistIcon,
  calibration: CalibrationIcon,
  receiving: TruckIcon,
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function TodayTab({
  today,
  pendingLogIds,
  onOpen,
  locationId,
  businessDate,
  onOpenProducts,
  lang,
}: {
  today: TodayResponse;
  pendingLogIds: Set<string>;
  onOpen: (logDefinitionId: string) => void;
  locationId: string;
  businessDate: string;
  onOpenProducts: () => void;
  lang: Lang;
}) {
  const t = strings[lang];
  const [expiring, setExpiring] = useState<OpenItemRecord[]>([]);
  const tomorrow = addDaysToBusinessDate(businessDate, 1);

  useEffect(() => {
    fetchOpenItems(locationId, true)
      .then((r) => setExpiring(r.items.filter((i) => i.useByDate === businessDate || i.useByDate === tomorrow)))
      .catch(() => setExpiring([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, businessDate]);

  const pct = today.totalCount > 0 ? Math.round((today.doneCount / today.totalCount) * 100) : 0;
  const allDone = today.totalCount > 0 && today.doneCount === today.totalCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 44, lineHeight: 1, color: allDone ? "var(--color-pass-text)" : "var(--color-text)" }}>
            {today.doneCount}
          </span>
          <span style={{ fontSize: 16, lineHeight: 1.3, color: "var(--color-muted)" }}>{t.ofDoneToday(today.doneCount, today.totalCount)}</span>
        </div>
        {today.totalCount > 0 && (
          <div
            role="progressbar"
            aria-valuenow={pct}
            style={{ height: 8, background: "var(--color-surface-sunken)", border: "1px solid var(--color-divider)", overflow: "hidden" }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: allDone ? "var(--color-pass)" : "var(--color-accent)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}
      </div>

      {expiring.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-alert-text)" }}>{t.productsExpiringSoon}</span>
          {expiring.map((item) => (
            <button
              key={item.id}
              onClick={onOpenProducts}
              style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 58, padding: "10px 14px", background: "transparent", border: "1px solid var(--color-alert-border)", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15.5 }}>{item.productNameSnapshot}</span>
                <span style={{ fontSize: 12.5, color: "var(--color-alert-text)" }}>
                  {item.useByDate === businessDate ? t.productsExpiringToday : t.productsExpiringTomorrow}
                  {item.storageLocation ? ` · ${item.storageLocation}` : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {today.todo.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.todo}</span>
          {today.todo.map((item) => {
            const KindIcon = KIND_ICON[item.kind];
            return (
              <button
                key={item.logDefinitionId}
                className="blueprint"
                onClick={() => onOpen(item.logDefinitionId)}
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 74, padding: "12px 14px", background: "transparent", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ display: "flex", flex: "none", color: "var(--color-accent)" }}>
                  <KindIcon size={24} />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, lineHeight: 1.2 }}>{item.name}</span>
                  <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{item.sub}</span>
                </span>
                <span style={{ color: "var(--color-muted)" }}>
                  <ChevronRightIcon size={16} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {today.done.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.done}</span>
          {today.done.map((item) => (
            <button
              key={item.logDefinitionId}
              onClick={() => onOpen(item.logDefinitionId)}
              style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 62, padding: "10px 14px", background: "transparent", border: 0, borderBottom: "1px solid var(--color-divider)", cursor: "pointer", textAlign: "left" }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  flex: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-pass)",
                  color: "#fff",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, lineHeight: 1.2, flex: 1, color: "var(--color-muted)" }}>{item.name}</span>
              <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
                {pendingLogIds.has(item.logDefinitionId) ? t.syncing : timeLabel(item.submittedAt)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import type { TodayResponse } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function TodayTab({
  today,
  pendingLogIds,
  onOpen,
  lang,
}: {
  today: TodayResponse;
  pendingLogIds: Set<string>;
  onOpen: (logDefinitionId: string) => void;
  lang: Lang;
}) {
  const t = strings[lang];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 44, lineHeight: 1 }}>{today.doneCount}</span>
        <span style={{ fontSize: 16, lineHeight: 1.3, color: "var(--color-muted)" }}>{t.ofDoneToday(today.doneCount, today.totalCount)}</span>
      </div>

      {today.todo.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.todo}</span>
          {today.todo.map((item) => (
            <button
              key={item.logDefinitionId}
              className="blueprint"
              onClick={() => onOpen(item.logDefinitionId)}
              style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 74, padding: "12px 14px", background: "transparent", cursor: "pointer", textAlign: "left" }}
            >
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, lineHeight: 1.2 }}>{item.name}</span>
                <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{item.sub}</span>
              </span>
              <svg width="9" height="16" viewBox="0 0 8 14">
                <path d="M1 1l6 6-6 6" stroke="#1d1f20" strokeOpacity=".45" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
          ))}
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
              <span style={{ width: 14, height: 14, flex: "none", background: "var(--color-accent)" }} />
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, lineHeight: 1.2, flex: 1, color: "var(--color-muted)" }}>{item.name}</span>
              <span style={{ fontSize: 13, color: "rgba(29,31,32,.45)" }}>
                {pendingLogIds.has(item.logDefinitionId) ? t.syncing : timeLabel(item.submittedAt)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

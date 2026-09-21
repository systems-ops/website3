"use client";

import { useEffect, useState } from "react";
import { claimSideworkTask, completeSideworkTask, fetchSideworkTasks } from "./api-client";
import type { SideworkShift, SideworkTaskRecord } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

const SHIFT_ORDER: SideworkShift[] = ["OPENING", "RUNNING", "CLOSING", "DOWNTIME"];

export default function SideworkTab({
  locationId,
  businessDate,
  lang,
}: {
  locationId: string;
  businessDate: string;
  lang: Lang;
}) {
  const t = strings[lang];
  const [tasks, setTasks] = useState<SideworkTaskRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    fetchSideworkTasks(locationId)
      .then((r) => setTasks(r.tasks))
      .catch(() => {});
  }

  useEffect(refresh, [locationId]);

  async function claim(taskId: string) {
    setBusyId(taskId);
    try {
      await claimSideworkTask(taskId, locationId, businessDate);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function complete(taskId: string) {
    setBusyId(taskId);
    try {
      await completeSideworkTask(taskId, locationId, businessDate);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  const shiftLabel: Record<SideworkShift, string> = {
    OPENING: t.sideworkShiftOpening,
    RUNNING: t.sideworkShiftRunning,
    CLOSING: t.sideworkShiftClosing,
    DOWNTIME: t.sideworkShiftDowntime,
  };

  if (tasks.length === 0) {
    return (
      <div style={{ paddingTop: 40, textAlign: "center", color: "var(--color-muted)", fontSize: 15 }}>
        {t.sideworkNothingHere}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 20 }}>
      {SHIFT_ORDER.filter((shift) => tasks.some((task) => task.shift === shift)).map((shift) => {
        const shiftTasks = tasks.filter((task) => task.shift === shift);
        const categories = Array.from(new Set(shiftTasks.map((task) => task.category)));
        return (
          <div key={shift} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{shiftLabel[shift]}</span>
            {categories.map((category) => (
              <div key={category} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, color: "var(--color-muted)" }}>
                  {category}
                </span>
                {shiftTasks
                  .filter((task) => task.category === category)
                  .map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 58,
                        padding: "10px 14px",
                        border: `1px solid ${task.status === "DONE" ? "var(--color-accent)" : "var(--color-divider)"}`,
                        background: task.status === "DONE" ? "rgba(60,122,79,.06)" : "transparent",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: 15.5,
                            lineHeight: 1.3,
                            textDecoration: task.status === "DONE" ? "line-through" : "none",
                            color: task.status === "DONE" ? "var(--color-muted)" : "var(--color-text)",
                          }}
                        >
                          {task.title}
                        </span>
                        {task.status === "DONE" && task.completedSignatureName && (
                          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{t.sideworkDoneBy(task.completedSignatureName)}</span>
                        )}
                        {task.status === "CLAIMED" && task.claimedSignatureName && (
                          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{t.sideworkClaimedBy(task.claimedSignatureName)}</span>
                        )}
                      </div>
                      {task.status !== "DONE" && (
                        <div style={{ display: "flex", gap: 6, flex: "none" }}>
                          {task.status === "OPEN" && (
                            <button
                              onClick={() => claim(task.id)}
                              disabled={busyId === task.id}
                              className="btn btn-secondary"
                              style={{ minHeight: 44, minWidth: 64, fontSize: 13 }}
                            >
                              {t.sideworkClaim}
                            </button>
                          )}
                          <button
                            onClick={() => complete(task.id)}
                            disabled={busyId === task.id}
                            className="btn btn-primary"
                            style={{ minHeight: 44, minWidth: 64, fontSize: 13 }}
                          >
                            {t.sideworkDone}
                          </button>
                        </div>
                      )}
                      {task.status === "DONE" && (
                        <span style={{ width: 22, height: 22, flex: "none", borderRadius: "50%", background: "var(--color-accent)" }} />
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  fetchLogEntriesByMonth,
  fetchTrace,
  fetchVerifications,
  managerLogout,
  submitReceivingReview,
  submitVerification,
} from "./api-client";
import type { ReceivingReviewPayload, TraceBatch, WeekSummary } from "./api-client";
import type { Location, LogEntryRecord, Manager } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

const RECEIVING_LOG_ID = "receiving-log";

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function emptyReview(): ReceivingReviewPayload {
  return { approved: true, releasedForUse: true };
}

export default function ManagerView({
  manager,
  locations,
  lang,
  onSignOut,
}: {
  manager: Manager;
  locations: Location[];
  lang: Lang;
  onSignOut: () => void;
}) {
  const t = strings[lang];
  const [locationId, setLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const [sitesOpen, setSitesOpen] = useState(false);
  const [entries, setEntries] = useState<LogEntryRecord[]>([]);
  const [selected, setSelected] = useState<LogEntryRecord | null>(null);
  const [review, setReview] = useState<ReceivingReviewPayload>(emptyReview());
  const [busy, setBusy] = useState(false);
  const [weekSummaries, setWeekSummaries] = useState<WeekSummary[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekSummary | null>(null);
  const [verifyComments, setVerifyComments] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [traceQuery, setTraceQuery] = useState("");
  const [traceLocationScoped, setTraceLocationScoped] = useState(true);
  const [traceResults, setTraceResults] = useState<TraceBatch[]>([]);
  const [traceBusy, setTraceBusy] = useState(false);
  const [traceSearched, setTraceSearched] = useState(false);

  function refreshWeeks() {
    if (!locationId) return;
    fetchVerifications(locationId, 4)
      .then((r) => setWeekSummaries(r.weeks))
      .catch(() => setWeekSummaries([]));
  }

  useEffect(() => {
    if (!locationId) return;
    fetchLogEntriesByMonth(locationId, RECEIVING_LOG_ID, currentMonthKey())
      .then((r) => setEntries(r.entries.filter((e) => !e.amendsId)))
      .catch(() => setEntries([]));
    refreshWeeks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  const needsReview = entries.filter((e) => !e.receivingReview);
  const reviewed = entries.filter((e) => e.receivingReview);
  const currentLocation = locations.find((l) => l.id === locationId);

  function openReview(entry: LogEntryRecord) {
    setSelected(entry);
    setReview(emptyReview());
  }

  async function submit() {
    if (!selected || !locationId) return;
    setBusy(true);
    try {
      await submitReceivingReview(selected.id, review);
      const { entries: fresh } = await fetchLogEntriesByMonth(locationId, RECEIVING_LOG_ID, currentMonthKey());
      setEntries(fresh.filter((e) => !e.amendsId));
      setSelected(null);
    } catch {
      // leave the form open so the manager can retry
    } finally {
      setBusy(false);
    }
  }

  function openWeek(week: WeekSummary) {
    setSelectedWeek(week);
    setVerifyComments("");
  }

  async function submitWeekVerification() {
    if (!selectedWeek || !locationId) return;
    setVerifyBusy(true);
    try {
      await submitVerification(locationId, selectedWeek.weekStart, verifyComments || undefined);
      refreshWeeks();
      setSelectedWeek(null);
    } catch {
      // leave the form open so the manager can retry
    } finally {
      setVerifyBusy(false);
    }
  }

  async function runTraceSearch() {
    if (!traceQuery.trim()) return;
    setTraceBusy(true);
    setTraceSearched(true);
    try {
      const { batches } = await fetchTrace(traceQuery.trim(), traceLocationScoped ? locationId ?? undefined : undefined);
      setTraceResults(batches);
    } catch {
      setTraceResults([]);
    } finally {
      setTraceBusy(false);
    }
  }

  function traceExportUrl(format: "csv" | "pdf") {
    const p = new URLSearchParams({ query: traceQuery.trim(), format });
    if (traceLocationScoped && locationId) p.set("locationId", locationId);
    return `/api/trace?${p.toString()}`;
  }

  return (
    <div className="kitchen-app" style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div style={{ flex: "none", padding: "54px 20px 14px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid var(--color-divider)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => setSitesOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: 0, background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, lineHeight: 1.1 }}>{currentLocation?.name}</span>
            <span style={{ fontSize: 13, color: "var(--color-accent-700)" }}>{t.change}</span>
          </button>
          <button
            onClick={async () => {
              await managerLogout().catch(() => {});
              onSignOut();
            }}
            style={{ background: "transparent", border: 0, color: "var(--color-accent-700)", fontSize: 13, cursor: "pointer" }}
          >
            {t.signOut}
          </button>
        </div>
        <span style={{ fontSize: 14, color: "var(--color-muted)" }}>
          {manager.name} · {manager.role}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
        <button
          onClick={() => setTraceOpen(true)}
          className="btn btn-secondary"
          style={{ minHeight: 52, fontSize: 15 }}
        >
          {t.trace}
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.weeklyVerification}</span>
          {weekSummaries.map((w) => {
            const hasFlags = w.outOfSpecCount + w.failedCount + w.lateCount + w.rejectedReceivingCount + w.missingByLog.length > 0;
            return (
              <button
                key={w.weekStart}
                className="blueprint"
                onClick={() => openWeek(w)}
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 66, padding: "12px 14px", background: "transparent", cursor: "pointer", textAlign: "left" }}
              >
                <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                <span
                  style={{
                    width: 14,
                    height: 14,
                    flex: "none",
                    background: w.verification ? "var(--color-accent)" : hasFlags ? "var(--color-alert)" : "transparent",
                    border: w.verification ? undefined : "1px solid var(--color-alert)",
                  }}
                />
                <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17 }}>{t.weekOf(w.weekStart)}</span>
                  <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
                    {w.verification
                      ? t.verifiedBy(w.verification.manager.name, w.verification.verifiedAt.slice(0, 10))
                      : [
                          w.outOfSpecCount ? t.outOfSpecCount(w.outOfSpecCount) : "",
                          w.failedCount ? t.failedCount(w.failedCount) : "",
                          w.lateCount ? t.lateCount(w.lateCount) : "",
                        ]
                          .filter(Boolean)
                          .join(" · ") || t.unverifiedWeeks}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.needsReview}</span>
          {needsReview.length === 0 && (
            <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{t.noReceivingLogsThisMonth}</span>
          )}
          {needsReview.map((e) => (
            <button
              key={e.id}
              className="blueprint"
              onClick={() => openReview(e)}
              style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 66, padding: "12px 14px", background: "transparent", cursor: "pointer", textAlign: "left" }}
            >
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17 }}>
                  {e.receivingDetail?.distributorName ?? e.businessDate}
                </span>
                <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{e.businessDate} · {e.signatureName}</span>
              </span>
            </button>
          ))}
        </div>

        {reviewed.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.reviewed}</span>
            {reviewed.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 56, padding: "8px 14px", borderBottom: "1px solid var(--color-divider)" }}>
                <span style={{ width: 14, height: 14, flex: "none", background: e.receivingReview?.approved ? "var(--color-accent)" : "var(--color-alert)" }} />
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, flex: 1, color: "var(--color-muted)" }}>
                  {e.receivingDetail?.distributorName ?? e.businessDate}
                </span>
                <span style={{ fontSize: 12.5, color: "var(--color-muted)" }}>{t.reviewedBy(e.receivingReview?.manager.name ?? "")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {sitesOpen && (
        <div onClick={() => setSitesOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(43,43,45,.5)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-bg)", padding: "20px 20px 42px", display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.chooseKitchen}</span>
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  setLocationId(loc.id);
                  setSitesOpen(false);
                }}
                style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 66, padding: "10px 14px", background: "transparent", border: "1px solid var(--color-divider)", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ width: 14, height: 14, flex: "none", background: loc.id === locationId ? "var(--color-accent)" : "transparent", border: "1px solid var(--color-accent)" }} />
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, flex: 1 }}>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {traceOpen && (
        <div className="kitchen-app" style={{ position: "absolute", inset: 0, background: "var(--color-bg)", display: "flex", flexDirection: "column", zIndex: 70 }}>
          <div style={{ flex: "none", padding: "54px 20px 14px", display: "flex", flexDirection: "column", gap: 6, borderBottom: "1px solid var(--color-divider)" }}>
            <button
              onClick={() => setTraceOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, marginLeft: -6, padding: "0 6px", background: "transparent", border: 0, cursor: "pointer", fontSize: 15, color: "var(--color-accent-700)" }}
            >
              {t.back}
            </button>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24 }}>{t.trace}</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="text"
              value={traceQuery}
              onChange={(e) => setTraceQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runTraceSearch()}
              placeholder={t.traceSearchPlaceholder}
              style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
              <span style={{ fontSize: 14 }}>{traceLocationScoped ? currentLocation?.name : t.traceAllKitchens}</span>
              <button
                onClick={() => setTraceLocationScoped((v) => !v)}
                className="btn btn-secondary"
                style={{ minHeight: 40, fontSize: 13 }}
              >
                {traceLocationScoped ? t.traceAllKitchens : currentLocation?.name}
              </button>
            </div>
            <button className="btn btn-primary" disabled={traceBusy || !traceQuery.trim()} onClick={runTraceSearch} style={{ minHeight: 52, fontSize: 16 }}>
              {t.traceSearch}
            </button>

            {traceSearched && !traceBusy && traceResults.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                <a className="btn btn-secondary" style={{ flex: 1, textAlign: "center", minHeight: 46, lineHeight: "46px" }} href={traceExportUrl("csv")}>
                  {t.exportCsv}
                </a>
                <a className="btn btn-secondary" style={{ flex: 1, textAlign: "center", minHeight: 46, lineHeight: "46px" }} href={traceExportUrl("pdf")}>
                  {t.exportPdf}
                </a>
              </div>
            )}

            {traceSearched && !traceBusy && traceResults.length === 0 && (
              <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{t.traceNoResults}</span>
            )}

            {traceResults.map((b) => (
              <div key={b.id} className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14 }}>
                <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18 }}>
                  {b.batchCode} — {b.productType}
                </span>
                <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
                  {b.location} · {b.businessDate} · {t.signedBy} {b.signatureName}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 12.5, letterSpacing: ".08em", color: "var(--color-muted)" }}>{t.inputsFromReceiving}</span>
                  {b.inputs.map((i, idx) => (
                    <span key={idx} style={{ fontSize: 13.5 }}>
                      {i.productNameSnapshot} — lot {i.supplierLotNumber ?? "—"} — {i.distributorName}, invoice {i.invoiceNumber}, received {i.receivedDate}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 12.5, letterSpacing: ".08em", color: "var(--color-muted)" }}>{t.outputs}</span>
                  {b.outputs.map((o, idx) => (
                    <span key={idx} style={{ fontSize: 13.5 }}>
                      {o.productName} — {o.quantity ?? "—"} — {o.bakeDate}
                      {o.bestByDate ? ` · best by ${o.bestByDate}` : ""} — {o.disposition}
                      {o.reference ? ` (${o.reference})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedWeek && (
        <div className="kitchen-app" style={{ position: "absolute", inset: 0, background: "var(--color-bg)", display: "flex", flexDirection: "column", zIndex: 70 }}>
          <div style={{ flex: "none", padding: "54px 20px 14px", display: "flex", flexDirection: "column", gap: 6, borderBottom: "1px solid var(--color-divider)" }}>
            <button
              onClick={() => setSelectedWeek(null)}
              style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, marginLeft: -6, padding: "0 6px", background: "transparent", border: 0, cursor: "pointer", fontSize: 15, color: "var(--color-accent-700)" }}
            >
              {t.back}
            </button>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24 }}>{t.weekOf(selectedWeek.weekStart)}</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 6, padding: 14 }}>
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              <span style={{ fontSize: 14 }}>{t.outOfSpecCount(selectedWeek.outOfSpecCount)}</span>
              <span style={{ fontSize: 14 }}>{t.failedCount(selectedWeek.failedCount)}</span>
              <span style={{ fontSize: 14 }}>{t.lateCount(selectedWeek.lateCount)}</span>
            </div>

            {selectedWeek.missingByLog.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.missingDays}</span>
                {selectedWeek.missingByLog.map((m) => (
                  <span key={m.logDefinitionId} style={{ fontSize: 13.5, color: "var(--color-alert-text)" }}>
                    {m.name}: {m.daysMissing.join(", ")}
                  </span>
                ))}
              </div>
            )}

            {selectedWeek.verification ? (
              <span style={{ fontSize: 14, color: "var(--color-muted)" }}>
                {t.verifiedBy(selectedWeek.verification.manager.name, selectedWeek.verification.verifiedAt.slice(0, 10))}
                {selectedWeek.verification.comments ? ` — ${selectedWeek.verification.comments}` : ""}
              </span>
            ) : (
              <input
                type="text"
                value={verifyComments}
                onChange={(e) => setVerifyComments(e.target.value)}
                placeholder={t.verificationComments}
                style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
              />
            )}
          </div>

          {!selectedWeek.verification && (
            <div style={{ flex: "none", padding: "14px 20px 32px", borderTop: "1px solid var(--color-divider)" }}>
              <button className="btn btn-primary" disabled={verifyBusy} onClick={submitWeekVerification} style={{ width: "100%", minHeight: 60, fontSize: 18 }}>
                {t.verifyThisWeek}
              </button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="kitchen-app" style={{ position: "absolute", inset: 0, background: "var(--color-bg)", display: "flex", flexDirection: "column", zIndex: 70 }}>
          <div style={{ flex: "none", padding: "54px 20px 14px", display: "flex", flexDirection: "column", gap: 6, borderBottom: "1px solid var(--color-divider)" }}>
            <button
              onClick={() => setSelected(null)}
              style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, marginLeft: -6, padding: "0 6px", background: "transparent", border: 0, cursor: "pointer", fontSize: 15, color: "var(--color-accent-700)" }}
            >
              {t.back}
            </button>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24 }}>{t.signOffReview}</span>
            <span style={{ fontSize: 14, color: "var(--color-muted)" }}>
              {selected.receivingDetail?.distributorName} · {selected.businessDate}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
              <span style={{ fontSize: 15.5, flex: 1 }}>{t.approve}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setReview((r) => ({ ...r, approved: v }))}
                    className={review.approved === v ? "btn btn-primary" : "btn btn-secondary"}
                    style={{ minHeight: 44, minWidth: 70, fontSize: 14 }}
                  >
                    {v ? t.approve : t.reject}
                  </button>
                ))}
              </div>
            </div>
            {!review.approved && (
              <input
                type="text"
                value={review.rejectedReason ?? ""}
                onChange={(e) => setReview((r) => ({ ...r, rejectedReason: e.target.value }))}
                placeholder={t.explainWhy}
                style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-alert-border)", background: "transparent" }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
              <span style={{ fontSize: 15.5, flex: 1 }}>{t.releasedForUse}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setReview((r) => ({ ...r, releasedForUse: v }))}
                    className={review.releasedForUse === v ? "btn btn-primary" : "btn btn-secondary"}
                    style={{ minHeight: 44, minWidth: 56, fontSize: 14 }}
                  >
                    {v ? t.yes : t.no}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={review.storageLocation ?? ""}
              onChange={(e) => setReview((r) => ({ ...r, storageLocation: e.target.value }))}
              placeholder={t.storage}
              style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
            />
            <input
              type="text"
              value={review.comments ?? ""}
              onChange={(e) => setReview((r) => ({ ...r, comments: e.target.value }))}
              placeholder={t.calibrationComment}
              style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
            />
          </div>

          <div style={{ flex: "none", padding: "14px 20px 32px", borderTop: "1px solid var(--color-divider)" }}>
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={submit}
              style={{ width: "100%", minHeight: 60, fontSize: 18 }}
            >
              {t.submitReview}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

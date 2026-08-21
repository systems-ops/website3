"use client";

import { useState } from "react";
import type { ApprovalField, CalibrationDraftRow, Draft, LogDefinition, LogUnit, ReceivingDraft, ReceivingLineDraft, StorageType } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

const CALIBRATION_TOLERANCE = 2;

function calibrationOutOfTolerance(row: CalibrationDraftRow): boolean {
  const ref = parseFloat(row.referenceReading.replace("−", "-"));
  const test = parseFloat(row.testReading.replace("−", "-"));
  if (isNaN(ref) || isNaN(test)) return false;
  return Math.abs(ref - test) > CALIBRATION_TOLERANCE;
}

function calibrationRowComplete(row: CalibrationDraftRow): boolean {
  if (!row.testTermId.trim() || row.referenceReading === "" || row.testReading === "") return false;
  return !calibrationOutOfTolerance(row) || row.comments.trim() !== "";
}

function approvalOk(field: ApprovalField): boolean {
  return field.approved || !!field.explain?.trim();
}

const STORAGE_TYPES: StorageType[] = ["dry", "refrig", "freezer"];

function cellKey(logUnitId: string, slotIndex: number) {
  return `${logUnitId}|${slotIndex}`;
}

function specText(unit: LogUnit, unitLabel: string) {
  const suffix = unit.unitOverride ?? unitLabel;
  if (unit.unitOverride?.includes("second")) return `Should be ${unit.low} seconds or more`;
  if (unit.high >= 200) return `Should be ${unit.low}${suffix} or hotter`;
  if (unit.high === 70) return `Should be ${unit.high}${suffix} or cooler`;
  return `Should be ${unit.low} to ${unit.high}${suffix}`;
}

function isBad(unit: LogUnit, raw: string | undefined) {
  if (raw == null || raw === "") return false;
  const v = parseFloat(raw.replace("−", "-"));
  return !isNaN(v) && (v < unit.low || v > unit.high);
}

function findUnresolved(log: LogDefinition, slots: string[], draft: Draft) {
  if (log.kind !== "temps") return null;
  for (const unit of log.units) {
    for (let s = 0; s < slots.length; s++) {
      const k = cellKey(unit.id, s);
      if (isBad(unit, draft.vals[k]) && !draft.ca[k]) {
        return { unit, slotIndex: s, key: k, value: draft.vals[k] };
      }
    }
  }
  return null;
}

export default function EntryFlow({
  log,
  locationName,
  cookName,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
  lang,
}: {
  log: LogDefinition;
  locationName: string;
  cookName: string;
  draft: Draft;
  onChangeDraft: (next: Draft) => void;
  onClose: () => void;
  onSubmit: () => void;
  lang: Lang;
}) {
  const t = strings[lang];
  const [pad, setPad] = useState<{ unit: LogUnit; slotIndex: number } | null>(null);
  const [buf, setBuf] = useState("");

  const slots = log.slots ?? [];
  const unitLabel = log.unit ? `°${log.unit}` : "";

  const unresolved = findUnresolved(log, slots, draft);

  let canSubmit = false;
  let submitNote = "";
  let filled = true;

  if (log.kind === "temps") {
    for (const unit of log.units) {
      for (let s = 0; s < slots.length; s++) {
        const raw = draft.vals[cellKey(unit.id, s)];
        if (raw == null || raw === "") filled = false;
      }
    }
    canSubmit = filled && !unresolved;
    submitNote = !filled
      ? t.fillEveryBox
      : unresolved
        ? t.pickWhatYouDid
        : t.signsAs(cookName, locationName);
  } else if (log.kind === "calibration") {
    const rows = draft.calibrationRows;
    const allComplete = rows.length > 0 && rows.every(calibrationRowComplete);
    canSubmit = allComplete;
    submitNote = rows.length === 0 ? t.addAtLeastOne : !allComplete ? t.fillEveryRow : t.signsAs(cookName, locationName);
  } else if (log.kind === "receiving") {
    const r = draft.receiving;
    const approvalsOk = [r.wfcfo, r.nonGmo, r.truckCondition, r.productsToStandard, r.labelsCurrent].every(approvalOk);
    const linesOk = r.lines.length > 0 && r.lines.every((l) => l.productName.trim() !== "");
    canSubmit = !!r.invoiceNumber.trim() && !!r.distributorName.trim() && approvalsOk && linesOk;
    submitNote = canSubmit ? t.signsAs(cookName, locationName) : t.fillReceivingRequired;
  } else {
    const total = log.items.length;
    const checkedCount = log.items.filter((i) => draft.checks[i.id]).length;
    canSubmit = checkedCount === total && total > 0;
    submitNote = canSubmit ? t.signsAs(cookName, locationName) : t.ticked(checkedCount, total);
  }

  function addCalibrationRow() {
    onChangeDraft({
      ...draft,
      calibrationRows: [...draft.calibrationRows, { testTermId: "", referenceReading: "", testReading: "", comments: "" }],
    });
  }

  function updateCalibrationRow(index: number, patch: Partial<CalibrationDraftRow>) {
    onChangeDraft({
      ...draft,
      calibrationRows: draft.calibrationRows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    });
  }

  function removeCalibrationRow(index: number) {
    onChangeDraft({ ...draft, calibrationRows: draft.calibrationRows.filter((_, i) => i !== index) });
  }

  function updateReceiving(patch: Partial<ReceivingDraft>) {
    onChangeDraft({ ...draft, receiving: { ...draft.receiving, ...patch } });
  }

  function addReceivingLine() {
    updateReceiving({
      lines: [
        ...draft.receiving.lines,
        { productName: "", productId: "", productCount: "", lotNumber: "", allergenProduct: false, labeledOrganic: false, storageType: "dry" },
      ],
    });
  }

  function updateReceivingLine(index: number, patch: Partial<ReceivingLineDraft>) {
    updateReceiving({ lines: draft.receiving.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)) });
  }

  function removeReceivingLine(index: number) {
    updateReceiving({ lines: draft.receiving.lines.filter((_, i) => i !== index) });
  }

  function renderBoolToggle(label: string, value: boolean, onChange: (v: boolean) => void) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <span style={{ fontSize: 15.5, flex: 1 }}>{label}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              onClick={() => onChange(v)}
              className={value === v ? "btn btn-primary" : "btn btn-secondary"}
              style={{ minHeight: 40, minWidth: 56, fontSize: 14 }}
            >
              {v ? t.yes : t.no}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderApproval(label: string, field: ApprovalField, onChange: (f: ApprovalField) => void) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {renderBoolToggle(label, field.approved, (approved) => onChange({ approved, explain: field.explain }))}
        {!field.approved && (
          <input
            type="text"
            value={field.explain ?? ""}
            onChange={(e) => onChange({ approved: field.approved, explain: e.target.value })}
            placeholder={t.explainWhy}
            style={{ minHeight: 44, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-alert-border)", background: "transparent" }}
          />
        )}
      </div>
    );
  }

  function openPad(unit: LogUnit, slotIndex: number) {
    const raw = draft.vals[cellKey(unit.id, slotIndex)];
    setBuf(raw ?? "");
    setPad({ unit, slotIndex });
  }

  function pressKey(key: string) {
    if (key === "⌫") return setBuf((b) => b.slice(0, -1));
    if (key === "−") return setBuf((b) => (b.startsWith("−") ? b.slice(1) : "−" + b));
    setBuf((b) => (b + key).slice(0, 5));
  }

  function savePad() {
    if (!pad) return;
    if (buf === "") return setPad(null);
    const k = cellKey(pad.unit.id, pad.slotIndex);
    onChangeDraft({ ...draft, vals: { ...draft.vals, [k]: buf } });
    setPad(null);
    setBuf("");
  }

  function pickCorrectiveAction(label: string) {
    if (!unresolved) return;
    onChangeDraft({ ...draft, ca: { ...draft.ca, [unresolved.key]: label } });
  }

  function toggleItem(itemId: string) {
    onChangeDraft({ ...draft, checks: { ...draft.checks, [itemId]: !draft.checks[itemId] } });
  }

  return (
    <div
      className="kitchen-app"
      style={{ position: "absolute", inset: 0, background: "var(--color-bg)", display: "flex", flexDirection: "column", zIndex: 70 }}
    >
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
        <span style={{ fontSize: 14, color: "var(--color-muted)" }}>
          {log.kind === "temps"
            ? t.tapAndType
            : log.kind === "calibration"
              ? t.addThermometer
              : log.kind === "receiving"
                ? t.products
                : t.tickEach}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {unresolved && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, border: "1px solid var(--color-alert-border)", background: "var(--color-alert-fill)" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, color: "var(--color-alert-text)" }}>
              {unresolved.unit.name} read {unresolved.value} — outside the range
            </span>
            <span style={{ fontSize: 14.5, color: "rgba(29,31,32,.72)" }}>{t.whatDidYouDo}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {log.correctiveActions.map((label) => (
                <button
                  key={label}
                  onClick={() => pickCorrectiveAction(label)}
                  style={{ minHeight: 54, padding: "8px 14px", background: "transparent", border: "1px solid var(--color-alert-border)", color: "var(--color-alert-text)", cursor: "pointer", textAlign: "left", fontSize: 15.5 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {log.kind === "temps" &&
          log.units.map((unit) => {
            const fixes: string[] = [];
            return (
              <div key={unit.id} className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
                <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, lineHeight: 1.2 }}>{unit.name}</span>
                  <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{specText(unit, unitLabel)}</span>
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {slots.map((slot, s) => {
                    const k = cellKey(unit.id, s);
                    const raw = draft.vals[k];
                    const bad = isBad(unit, raw);
                    if (draft.ca[k]) fixes.push(`${slot}: ${draft.ca[k]}`);
                    return (
                      <button
                        key={s}
                        onClick={() => openPad(unit, s)}
                        style={{
                          flex: 1,
                          minHeight: 78,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          background: "transparent",
                          border: `1px solid ${bad ? "var(--color-alert-border)" : "var(--color-divider)"}`,
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{slot}</span>
                        <span
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            fontSize: 28,
                            lineHeight: 1,
                            color: bad ? "var(--color-alert)" : raw ? "var(--color-text)" : "var(--color-disabled)",
                          }}
                        >
                          {raw ?? "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {fixes.length > 0 && (
                  <span style={{ fontSize: 13.5, lineHeight: 1.4, color: "var(--color-alert-text)" }}>{fixes.join("  ·  ")}</span>
                )}
              </div>
            );
          })}

        {log.kind === "check" &&
          log.items.map((item) => {
            const on = !!draft.checks[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 66, padding: "10px 14px", background: "transparent", border: "1px solid var(--color-divider)", cursor: "pointer", textAlign: "left" }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    flex: "none",
                    border: "1px solid rgba(29,31,32,.45)",
                    background: on ? "var(--color-accent)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {on && (
                    <svg width="15" height="12" viewBox="0 0 12 10">
                      <path d="M1 5l3.5 3.5L11 1.5" stroke="#f2f2f3" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: 16.5, lineHeight: 1.35, flex: 1 }}>{item.label}</span>
              </button>
            );
          })}

        {log.kind === "calibration" && (
          <>
            {draft.calibrationRows.map((row, i) => {
              const outOfTolerance = calibrationOutOfTolerance(row);
              return (
                <div
                  key={i}
                  className="blueprint"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: 14,
                    border: outOfTolerance ? "1px solid var(--color-alert-border)" : undefined,
                  }}
                >
                  <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="text"
                      value={row.testTermId}
                      onChange={(e) => updateCalibrationRow(i, { testTermId: e.target.value })}
                      placeholder={t.thermometerId}
                      style={{
                        flex: 1,
                        minHeight: 44,
                        padding: "0 10px",
                        fontSize: 16,
                        fontFamily: "var(--font-heading)",
                        fontWeight: 600,
                        border: "1px solid var(--color-divider)",
                        background: "transparent",
                      }}
                    />
                    <button
                      onClick={() => removeCalibrationRow(i)}
                      style={{ background: "transparent", border: 0, color: "var(--color-alert-text)", fontSize: 13.5, cursor: "pointer", padding: "8px 4px" }}
                    >
                      {t.removeRow}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{t.referenceReading}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={row.referenceReading}
                        onChange={(e) => updateCalibrationRow(i, { referenceReading: e.target.value })}
                        style={{ minHeight: 52, padding: "0 10px", fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, border: "1px solid var(--color-divider)", background: "transparent" }}
                      />
                    </label>
                    <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{t.testReading}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={row.testReading}
                        onChange={(e) => updateCalibrationRow(i, { testReading: e.target.value })}
                        style={{
                          minHeight: 52,
                          padding: "0 10px",
                          fontSize: 20,
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                          border: `1px solid ${outOfTolerance ? "var(--color-alert-border)" : "var(--color-divider)"}`,
                          color: outOfTolerance ? "var(--color-alert)" : "var(--color-text)",
                          background: "transparent",
                        }}
                      />
                    </label>
                  </div>
                  {outOfTolerance && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 13.5, color: "var(--color-alert-text)" }}>
                        {t.outOfTolerance(CALIBRATION_TOLERANCE)}
                      </span>
                      <input
                        type="text"
                        value={row.comments}
                        onChange={(e) => updateCalibrationRow(i, { comments: e.target.value })}
                        placeholder={t.calibrationComment}
                        style={{ minHeight: 44, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-alert-border)", background: "transparent" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <button className="btn btn-secondary" onClick={addCalibrationRow} style={{ minHeight: 54, fontSize: 15.5 }}>
              {t.addThermometer}
            </button>
          </>
        )}

        {log.kind === "receiving" && (
          <>
            <div className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14 }}>
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              <input
                type="text"
                value={draft.receiving.invoiceNumber}
                onChange={(e) => updateReceiving({ invoiceNumber: e.target.value })}
                placeholder={t.invoiceNumber}
                style={{ minHeight: 48, padding: "0 10px", fontSize: 16, border: "1px solid var(--color-divider)", background: "transparent" }}
              />
              <input
                type="text"
                value={draft.receiving.distributorName}
                onChange={(e) => updateReceiving({ distributorName: e.target.value })}
                placeholder={t.distributorName}
                style={{ minHeight: 48, padding: "0 10px", fontSize: 16, border: "1px solid var(--color-divider)", background: "transparent" }}
              />
              {renderApproval(t.wfcfoApproved, draft.receiving.wfcfo, (f) => updateReceiving({ wfcfo: f }))}
              {renderApproval(t.nonGmoApproved, draft.receiving.nonGmo, (f) => updateReceiving({ nonGmo: f }))}
              {renderApproval(t.truckConditionGood, draft.receiving.truckCondition, (f) => updateReceiving({ truckCondition: f }))}
              {renderBoolToggle(t.truckTempCompliant, draft.receiving.truckTempCompliant, (v) => updateReceiving({ truckTempCompliant: v }))}
              <input
                type="number"
                inputMode="decimal"
                value={draft.receiving.truckTempF}
                onChange={(e) => updateReceiving({ truckTempF: e.target.value })}
                placeholder={t.truckTempF}
                style={{ minHeight: 48, padding: "0 10px", fontSize: 16, border: "1px solid var(--color-divider)", background: "transparent" }}
              />
              {renderBoolToggle(t.palletConditionGood, draft.receiving.palletConditionGood, (v) => updateReceiving({ palletConditionGood: v }))}
              {renderBoolToggle(t.plasticWrapGood, draft.receiving.plasticWrapGood, (v) => updateReceiving({ plasticWrapGood: v }))}
              {renderApproval(t.productsToStandard, draft.receiving.productsToStandard, (f) => updateReceiving({ productsToStandard: f }))}
              {renderApproval(t.labelsCurrent, draft.receiving.labelsCurrent, (f) => updateReceiving({ labelsCurrent: f }))}
              {renderBoolToggle(t.sealIntact, draft.receiving.sealIntact, (v) => updateReceiving({ sealIntact: v }))}
              {renderBoolToggle(t.caseCountMatches, draft.receiving.caseCountMatches, (v) => updateReceiving({ caseCountMatches: v }))}
              {renderBoolToggle(t.supplierPaperworkAttached, draft.receiving.supplierPaperworkAttached, (v) => updateReceiving({ supplierPaperworkAttached: v }))}
              {renderBoolToggle(t.organicCertCurrent, draft.receiving.organicCertCurrent, (v) => updateReceiving({ organicCertCurrent: v }))}
            </div>

            <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.products}</span>
            {draft.receiving.lines.map((line, i) => (
              <div key={i} className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
                <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="text"
                    value={line.productName}
                    onChange={(e) => updateReceivingLine(i, { productName: e.target.value })}
                    placeholder={t.productName}
                    style={{ flex: 1, minHeight: 44, padding: "0 10px", fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, border: "1px solid var(--color-divider)", background: "transparent" }}
                  />
                  <button
                    onClick={() => removeReceivingLine(i)}
                    style={{ background: "transparent", border: 0, color: "var(--color-alert-text)", fontSize: 13.5, cursor: "pointer", padding: "8px 4px" }}
                  >
                    {t.removeRow}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={line.productId}
                    onChange={(e) => updateReceivingLine(i, { productId: e.target.value })}
                    placeholder={t.productId}
                    style={{ flex: 1, minHeight: 44, padding: "0 10px", fontSize: 14, border: "1px solid var(--color-divider)", background: "transparent" }}
                  />
                  <input
                    type="text"
                    value={line.productCount}
                    onChange={(e) => updateReceivingLine(i, { productCount: e.target.value })}
                    placeholder={t.productCount}
                    style={{ flex: 1, minHeight: 44, padding: "0 10px", fontSize: 14, border: "1px solid var(--color-divider)", background: "transparent" }}
                  />
                  <input
                    type="text"
                    value={line.lotNumber}
                    onChange={(e) => updateReceivingLine(i, { lotNumber: e.target.value })}
                    placeholder={t.lotNumber}
                    style={{ flex: 1, minHeight: 44, padding: "0 10px", fontSize: 14, border: "1px solid var(--color-divider)", background: "transparent" }}
                  />
                </div>
                {renderBoolToggle(t.allergenProduct, line.allergenProduct, (v) => updateReceivingLine(i, { allergenProduct: v }))}
                {renderBoolToggle(t.labeledOrganic, line.labeledOrganic, (v) => updateReceivingLine(i, { labeledOrganic: v }))}
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15.5, flex: 1 }}>{t.storage}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {STORAGE_TYPES.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateReceivingLine(i, { storageType: s })}
                        className={line.storageType === s ? "btn btn-primary" : "btn btn-secondary"}
                        style={{ minHeight: 40, minWidth: 56, fontSize: 13 }}
                      >
                        {s === "dry" ? t.dry : s === "refrig" ? t.refrig : t.freezer}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addReceivingLine} style={{ minHeight: 54, fontSize: 15.5 }}>
              {t.addProduct}
            </button>
          </>
        )}

        <span style={{ fontSize: 12.5, color: "rgba(29,31,32,.4)", paddingTop: 4 }}>{log.formCode}</span>
      </div>

      <div style={{ flex: "none", padding: "14px 20px 32px", borderTop: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          className={canSubmit ? "btn btn-primary" : "btn btn-secondary"}
          disabled={!canSubmit}
          onClick={onSubmit}
          style={{ width: "100%", minHeight: 60, fontSize: 18, letterSpacing: ".02em" }}
        >
          {t.submit}
        </button>
        <span style={{ fontSize: 13.5, textAlign: "center", color: "var(--color-muted)" }}>{submitNote}</span>
      </div>

      {pad && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(43,43,45,.45)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 80 }}>
          <div style={{ background: "var(--color-bg)", padding: "16px 14px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "0 6px" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, lineHeight: 1.15 }}>{pad.unit.name}</span>
                <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>
                  {slots[pad.slotIndex]} · {specText(pad.unit, unitLabel).replace("Should be ", "")}
                </span>
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 46,
                  lineHeight: 0.95,
                  color: isBad(pad.unit, buf) ? "var(--color-alert)" : "var(--color-text)",
                }}
              >
                {buf === "" ? "—" : buf}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "0", "⌫"].map((k) => (
                <button key={k} className="btn btn-secondary" onClick={() => pressKey(k)} style={{ minHeight: 60, fontSize: 24 }}>
                  {k}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setPad(null)} style={{ flex: 1, minHeight: 56, fontSize: 16 }}>
                {t.cancel}
              </button>
              <button className="btn btn-primary" onClick={savePad} style={{ flex: 2, minHeight: 56, fontSize: 16 }}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

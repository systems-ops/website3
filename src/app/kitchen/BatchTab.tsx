"use client";

import { useEffect, useState } from "react";
import { ApiRequestError, createBatch, fetchRecentLots } from "./api-client";
import type { BatchOutputDraft, ReceivedLot } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

function emptyOutput(bakeDate: string): BatchOutputDraft {
  return { productName: "", quantity: "", bakeDate, disposition: "sold_in_store", bestByDate: "", reference: "" };
}

const DISPOSITIONS = ["held", "sold_in_store", "shipped"] as const;

export default function BatchTab({
  locationId,
  businessDate,
  signerName,
  lang,
  onSaved,
}: {
  locationId: string;
  businessDate: string;
  signerName: string;
  lang: Lang;
  onSaved: (message: string) => void;
}) {
  const t = strings[lang];
  const [lots, setLots] = useState<ReceivedLot[]>([]);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [batchCode, setBatchCode] = useState("");
  const [productType, setProductType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [outputs, setOutputs] = useState<BatchOutputDraft[]>([emptyOutput(businessDate)]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecentLots(locationId)
      .then((r) => setLots(r.lots))
      .catch(() => setLots([]));
  }, [locationId]);

  function toggleLot(id: string) {
    setSelectedLots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateOutput(index: number, patch: Partial<BatchOutputDraft>) {
    setOutputs((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  function removeOutput(index: number) {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setBatchCode("");
    setProductType("");
    setQuantity("");
    setSelectedLots(new Set());
    setOutputs([emptyOutput(businessDate)]);
  }

  const canSubmit =
    batchCode.trim() &&
    productType.trim() &&
    selectedLots.size > 0 &&
    outputs.length > 0 &&
    outputs.every((o) => o.productName.trim() && o.bakeDate);

  async function submit() {
    if (!canSubmit) {
      setError(t.fillEveryBatchField);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const { batch } = await createBatch({
        locationId,
        businessDate,
        batchCode: batchCode.trim(),
        productType: productType.trim(),
        ...(quantity.trim() ? { quantity: quantity.trim() } : {}),
        inputs: Array.from(selectedLots).map((receivingLineId) => ({ receivingLineId })),
        outputs: outputs.map((o) => ({
          productName: o.productName.trim(),
          bakeDate: o.bakeDate,
          disposition: o.disposition,
          ...(o.quantity.trim() ? { quantity: o.quantity.trim() } : {}),
          ...(o.bestByDate ? { bestByDate: o.bestByDate } : {}),
          ...(o.reference.trim() ? { reference: o.reference.trim() } : {}),
        })),
      });
      resetForm();
      onSaved(t.batchSaved(batch.batchCode));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t.duplicateBatchCode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.newBatch}</span>
        <input
          type="text"
          value={batchCode}
          onChange={(e) => setBatchCode(e.target.value)}
          placeholder={t.batchCode}
          style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
        />
        <input
          type="text"
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          placeholder={t.productType}
          style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
        />
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={t.quantityMade}
          style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.inputsFromReceiving}</span>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{t.tapRecentLots}</span>
        {lots.length === 0 && <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{t.noRecentLots}</span>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {lots.map((lot) => {
            const selected = selectedLots.has(lot.receivingLineId);
            return (
              <button
                key={lot.receivingLineId}
                onClick={() => toggleLot(lot.receivingLineId)}
                style={{
                  padding: "10px 14px",
                  background: selected ? "var(--color-accent)" : "transparent",
                  color: selected ? "#f2f2f3" : "var(--color-text)",
                  border: "1px solid var(--color-divider)",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>{lot.productName}</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>
                  {lot.lotNumber ?? "—"} · {lot.distributorName} · {lot.receivedDate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.outputs}</span>
        {outputs.map((o, i) => (
          <div key={i} className="blueprint" style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14 }}>
            <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
            <input
              type="text"
              value={o.productName}
              onChange={(e) => updateOutput(i, { productName: e.target.value })}
              placeholder={t.productName}
              style={{ minHeight: 46, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
            />
            <input
              type="text"
              value={o.quantity}
              onChange={(e) => updateOutput(i, { quantity: e.target.value })}
              placeholder={t.quantityMade}
              style={{ minHeight: 46, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12.5, color: "var(--color-muted)" }}>{t.bakeDate}</span>
              <input
                type="date"
                value={o.bakeDate}
                onChange={(e) => updateOutput(i, { bakeDate: e.target.value })}
                style={{ minHeight: 46, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12.5, color: "var(--color-muted)" }}>{t.bestByDate}</span>
              <input
                type="date"
                value={o.bestByDate}
                onChange={(e) => updateOutput(i, { bestByDate: e.target.value })}
                style={{ minHeight: 46, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12.5, color: "var(--color-muted)" }}>{t.disposition}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {DISPOSITIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => updateOutput(i, { disposition: d })}
                    className={o.disposition === d ? "btn btn-primary" : "btn btn-secondary"}
                    style={{ flex: 1, minHeight: 44, fontSize: 13 }}
                  >
                    {d === "held" ? t.dispositionHeld : d === "sold_in_store" ? t.dispositionSold : t.dispositionShipped}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={o.reference}
              onChange={(e) => updateOutput(i, { reference: e.target.value })}
              placeholder={t.reference}
              style={{ minHeight: 46, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "transparent" }}
            />
            {outputs.length > 1 && (
              <button
                onClick={() => removeOutput(i)}
                style={{ alignSelf: "flex-start", background: "transparent", border: 0, color: "var(--color-accent-700)", fontSize: 13, cursor: "pointer", padding: 0 }}
              >
                {t.removeRow}
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setOutputs((prev) => [...prev, emptyOutput(businessDate)])}
          className="btn btn-secondary"
          style={{ minHeight: 48, fontSize: 14 }}
        >
          {t.addOutput}
        </button>
      </div>

      {error && <span style={{ fontSize: 13.5, color: "var(--color-alert-text)" }}>{error}</span>}

      <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{t.signedBy}: {signerName}</span>

      <button className="btn btn-primary" disabled={busy} onClick={submit} style={{ width: "100%", minHeight: 60, fontSize: 18, marginBottom: 12 }}>
        {t.saveBatch}
      </button>
    </div>
  );
}

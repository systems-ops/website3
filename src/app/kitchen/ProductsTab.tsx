"use client";

import { useEffect, useState } from "react";
import { createOpenItem, discardOpenItem, fetchOpenItems, fetchProducts, flagLowStock } from "./api-client";
import type { OpenItemRecord, ProductRecord } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";
import LoadingScreen from "./LoadingScreen";

function addDaysLabel(dateStr: string, days: number): string {
  const dt = new Date(`${dateStr}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export default function ProductsTab({
  locationId,
  businessDate,
  lang,
}: {
  locationId: string;
  businessDate: string;
  lang: Lang;
}) {
  const t = strings[lang];
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [openItems, setOpenItems] = useState<OpenItemRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [prepOpen, setPrepOpen] = useState(false);
  const [prepProductId, setPrepProductId] = useState("");
  const [prepStorage, setPrepStorage] = useState("");
  const [prepUseBy, setPrepUseBy] = useState("");
  const [prepBusy, setPrepBusy] = useState(false);
  const [prepError, setPrepError] = useState("");

  const [discardTarget, setDiscardTarget] = useState<OpenItemRecord | null>(null);
  const [discardReason, setDiscardReason] = useState("");
  const [discardBusy, setDiscardBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  function refresh() {
    Promise.allSettled([
      fetchProducts(locationId).then((r) => setProducts(r.products)),
      fetchOpenItems(locationId, true).then((r) => setOpenItems(r.items)),
    ]).finally(() => setLoading(false));
  }

  useEffect(refresh, [locationId]);

  // A flag clears only when a manager marks it ordered/received (see
  // ManagerView), never from this tap — tapping again while already flagged
  // just records that it was raised again.
  async function raiseLowStock(product: ProductRecord) {
    setBusyId(product.id);
    try {
      await flagLowStock(product.id, locationId);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  const categories = Array.from(new Set(products.map((p) => p.category ?? "")));
  const prepProduct = products.find((p) => p.id === prepProductId);
  const autoUseBy = prepProduct?.shelfLifeDays != null ? addDaysLabel(businessDate, prepProduct.shelfLifeDays) : null;

  function openPrep() {
    setPrepProductId(products[0]?.id ?? "");
    setPrepStorage("");
    setPrepUseBy("");
    setPrepError("");
    setPrepOpen(true);
  }

  async function savePrep() {
    if (!prepProductId) return;
    if (!autoUseBy && !prepUseBy) {
      setPrepError(t.productsNoShelfLife);
      return;
    }
    setPrepBusy(true);
    setPrepError("");
    try {
      await createOpenItem({
        locationId,
        productId: prepProductId,
        openedDate: businessDate,
        useByDate: autoUseBy ? undefined : prepUseBy,
        storageLocation: prepStorage || undefined,
      });
      setPrepOpen(false);
      refresh();
    } catch {
      setPrepError(t.productsNoShelfLife);
    } finally {
      setPrepBusy(false);
    }
  }

  async function confirmDiscard() {
    if (!discardTarget || !discardReason.trim()) return;
    setDiscardBusy(true);
    try {
      await discardOpenItem(discardTarget.id, discardReason.trim());
      setDiscardTarget(null);
      setDiscardReason("");
      refresh();
    } finally {
      setDiscardBusy(false);
    }
  }

  const onHand = openItems.filter((i) => i.disposition === "ON_HAND");

  if (loading) {
    return <LoadingScreen />;
  }

  if (products.length === 0) {
    return (
      <div style={{ paddingTop: 40, textAlign: "center", color: "var(--color-muted)", fontSize: 15 }}>
        {t.productsNothingHere}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 20 }}>
      <button onClick={openPrep} className="btn btn-secondary" style={{ minHeight: 52, fontSize: 15 }}>
        {t.productsPrepLabel}
      </button>

      {categories.map((category) => (
        <div key={category} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {category && (
            <div style={{ padding: "6px 10px", background: "var(--color-surface-sunken)", borderLeft: "3px solid var(--color-accent)" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13.5, letterSpacing: ".08em", color: "var(--color-accent-900)" }}>
                {category.toUpperCase()}
              </span>
            </div>
          )}
          {products
            .filter((p) => (p.category ?? "") === category)
            .map((product) => (
              <div
                key={product.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 58,
                  padding: "10px 14px",
                  borderColor: product.lowStockFlag ? "var(--color-alert-border)" : "var(--color-divider)",
                  background: product.lowStockFlag ? "var(--color-alert-fill)" : "var(--color-surface)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15.5, lineHeight: 1.3 }}>{product.name}</span>
                  {product.lowStockFlag && (
                    <span style={{ fontSize: 12, color: "var(--color-alert-text)" }}>
                      {t.productsFlagged(product.lowStockFlag.raisedSignatureName)}
                      {product.lowStockFlag.raiseCount > 1 ? ` · ${t.productsFlaggedCount(product.lowStockFlag.raiseCount)}` : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => raiseLowStock(product)}
                  disabled={busyId === product.id}
                  className={product.lowStockFlag ? "btn btn-primary" : "btn btn-secondary"}
                  style={{ minHeight: 44, minWidth: 100, fontSize: 13, flex: "none" }}
                >
                  {t.productsRunningLow}
                </button>
              </div>
            ))}
        </div>
      ))}

      {onHand.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.productsOnHand}</span>
          {onHand.map((item) => {
            const isToday = item.useByDate === businessDate;
            const isTomorrow = item.useByDate === addDaysLabel(businessDate, 1);
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 58,
                  padding: "10px 14px",
                  borderColor: isToday ? "var(--color-alert-border)" : "var(--color-divider)",
                  background: isToday ? "var(--color-alert-fill)" : "var(--color-surface)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15 }}>{item.productNameSnapshot}</span>
                  <span style={{ fontSize: 12, color: isToday ? "var(--color-alert-text)" : "var(--color-muted)" }}>
                    {isToday ? t.productsExpiringToday : isTomorrow ? t.productsExpiringTomorrow : item.useByDate}
                    {item.storageLocation ? ` · ${item.storageLocation}` : ""}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDiscardTarget(item);
                    setDiscardReason("");
                  }}
                  className="btn btn-secondary"
                  style={{ minHeight: 40, fontSize: 13, flex: "none" }}
                >
                  {t.productsDiscard}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {prepOpen && (
        <div onClick={() => setPrepOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(29,31,32,.45)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-bg)", padding: "20px 20px 42px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-md)" }}>
            <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.productsPrepLabel}</span>
            <select
              value={prepProductId}
              onChange={(e) => setPrepProductId(e.target.value)}
              style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "var(--color-surface)" }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={prepStorage}
              onChange={(e) => setPrepStorage(e.target.value)}
              placeholder={t.productsPrepStorage}
              style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "var(--color-surface)" }}
            />
            {autoUseBy ? (
              <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{t.productsPrepUseByAuto(autoUseBy)}</span>
            ) : (
              <input
                type="date"
                value={prepUseBy}
                onChange={(e) => setPrepUseBy(e.target.value)}
                style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "var(--color-surface)" }}
              />
            )}
            {prepError && <span style={{ fontSize: 13, color: "var(--color-alert-text)" }}>{prepError}</span>}
            <button
              onClick={savePrep}
              disabled={prepBusy || !prepProductId}
              className="btn btn-primary"
              style={{ minHeight: 52, fontSize: 16 }}
            >
              {t.productsPrepSave}
            </button>
          </div>
        </div>
      )}

      {discardTarget && (
        <div onClick={() => setDiscardTarget(null)} style={{ position: "absolute", inset: 0, background: "rgba(29,31,32,.45)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-bg)", padding: "20px 20px 42px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-md)" }}>
            <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{discardTarget.productNameSnapshot}</span>
            <input
              type="text"
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              placeholder={t.productsDiscardReason}
              style={{ minHeight: 48, padding: "0 10px", fontSize: 15, border: "1px solid var(--color-divider)", background: "var(--color-surface)" }}
            />
            <button
              onClick={confirmDiscard}
              disabled={discardBusy || !discardReason.trim()}
              className="btn btn-primary"
              style={{ minHeight: 52, fontSize: 16 }}
            >
              {t.productsDiscardConfirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

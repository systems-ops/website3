"use client";

import { useEffect, useState } from "react";
import { ApiRequestError, fetchCooks, login } from "./api-client";
import type { Cook, Location } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

const PAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function LoginScreen({
  locations,
  lang,
  onSignedIn,
}: {
  locations: Location[];
  lang: Lang;
  onSignedIn: (cook: Cook, locationId: string) => void;
}) {
  const t = strings[lang];
  const [locationId, setLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const [cooks, setCooks] = useState<{ id: string; name: string }[]>([]);
  const [pickedCook, setPickedCook] = useState<{ id: string; name: string } | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!locationId) return;
    fetchCooks(locationId)
      .then((r) => setCooks(r.cooks))
      .catch(() => setCooks([]));
  }, [locationId]);

  function pickLocation(id: string) {
    setLocationId(id);
    setPickedCook(null);
    setPin("");
    setError("");
  }

  async function submitPin(nextPin: string) {
    if (!pickedCook || !locationId || nextPin.length < 4) return;
    setBusy(true);
    setError("");
    try {
      const { cook } = await login(pickedCook.id, locationId, nextPin);
      onSignedIn(cook, locationId);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t.wrongPin);
      setPin("");
    } finally {
      setBusy(false);
    }
  }

  function press(key: string) {
    if (busy) return;
    if (key === "⌫") return setPin((p) => p.slice(0, -1));
    if (key === "") return;
    const next = (pin + key).slice(0, 8);
    setPin(next);
    if (next.length === 4) submitPin(next);
  }

  return (
    <div
      className="kitchen-app"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        padding: "54px 20px 32px",
        gap: 24,
      }}
    >
      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 28 }}>
        {t.signIn}
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>
          {t.chooseKitchen}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => pickLocation(loc.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minHeight: 54,
                padding: "10px 14px",
                background: "transparent",
                border: "1px solid var(--color-divider)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  flex: "none",
                  background: loc.id === locationId ? "var(--color-accent)" : "transparent",
                  border: "1px solid var(--color-accent)",
                }}
              />
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, flex: 1 }}>
                {loc.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!pickedCook ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>
            {t.whoAreYou}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cooks.map((c) => (
              <button
                key={c.id}
                onClick={() => setPickedCook(c)}
                style={{
                  minHeight: 54,
                  padding: "10px 14px",
                  background: "transparent",
                  border: "1px solid var(--color-divider)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20 }}>
              {pickedCook.name}
            </span>
            <button
              onClick={() => setPickedCook(null)}
              style={{ background: "transparent", border: 0, color: "var(--color-accent-700)", fontSize: 14, cursor: "pointer" }}
            >
              {t.change}
            </button>
          </div>
          <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{t.enterPin}</span>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "1px solid var(--color-divider)",
                  background: i < pin.length ? "var(--color-accent)" : "transparent",
                }}
              />
            ))}
          </div>
          {error && (
            <span style={{ color: "var(--color-alert-text)", fontSize: 14, textAlign: "center" }}>{error}</span>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: "auto" }}>
            {PAD_KEYS.map((k, i) => (
              <button
                key={i}
                className="btn btn-secondary"
                disabled={k === "" || busy}
                onClick={() => press(k)}
                style={{ minHeight: 60, fontSize: 24, visibility: k === "" ? "hidden" : "visible" }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ApiRequestError, login, managerLogin } from "./api-client";
import type { Cook, Location, Manager } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";
import { LocationIcon } from "./icons";

const PAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
const PIN_LENGTH = 6;

export default function LoginScreen({
  locations,
  lang,
  onSignedIn,
  onManagerSignedIn,
}: {
  locations: Location[];
  lang: Lang;
  onSignedIn: (cook: Cook, locationId: string) => void;
  onManagerSignedIn: (manager: Manager) => void;
}) {
  const t = strings[lang];
  const [mode, setMode] = useState<"cook" | "manager">("cook");
  const [locationId, setLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function pickLocation(id: string) {
    setLocationId(id);
    setPin("");
    setError("");
  }

  function switchMode(next: "cook" | "manager") {
    setMode(next);
    setPin("");
    setError("");
  }

  async function submitPin(nextPin: string) {
    if (nextPin.length < PIN_LENGTH) return;
    if (mode === "cook" && !locationId) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "manager") {
        const { manager } = await managerLogin(nextPin);
        onManagerSignedIn(manager);
      } else {
        const { cook } = await login(locationId!, nextPin);
        onSignedIn(cook, locationId!);
      }
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
    const next = (pin + key).slice(0, PIN_LENGTH);
    setPin(next);
    if (next.length === PIN_LENGTH) submitPin(next);
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
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 32, color: "var(--color-accent-900)" }}>
          {t.signIn}
        </span>
        <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{t.signInSubtitle}</span>
      </div>

      {mode === "cook" && (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>
          {t.chooseKitchen}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {locations.map((loc) => {
            const active = loc.id === locationId;
            return (
              <button
                key={loc.id}
                className="card"
                onClick={() => pickLocation(loc.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 58,
                  padding: "10px 16px",
                  background: active ? "var(--color-accent-fill)" : "var(--color-surface)",
                  borderColor: active ? "var(--color-accent)" : "var(--color-divider)",
                  borderWidth: active ? 1.5 : 1,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", flex: "none", color: active ? "var(--color-accent)" : "var(--color-muted)" }}>
                  <LocationIcon size={20} />
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: 19,
                    flex: 1,
                    color: active ? "var(--color-accent-900)" : "var(--color-text)",
                  }}
                >
                  {loc.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, justifyContent: "center" }}>
        <span style={{ fontSize: 14, color: "var(--color-muted)", textAlign: "center" }}>{t.enterPin}</span>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: `1.5px solid ${i < pin.length ? "var(--color-accent)" : "var(--color-divider)"}`,
                background: i < pin.length ? "var(--color-accent)" : "var(--color-surface)",
                transition: "background 0.1s ease, border-color 0.1s ease",
              }}
            />
          ))}
        </div>
        {error && (
          <span style={{ color: "var(--color-alert-text)", fontSize: 14, textAlign: "center" }}>{error}</span>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 20, maxWidth: 420, width: "100%", alignSelf: "center" }}>
          {PAD_KEYS.map((k, i) => (
            <button
              key={i}
              className="btn btn-secondary"
              disabled={k === "" || busy || (mode === "cook" && !locationId)}
              onClick={() => press(k)}
              style={{ minHeight: 60, fontSize: 24, visibility: k === "" ? "hidden" : "visible" }}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={() => switchMode(mode === "cook" ? "manager" : "cook")}
          style={{ background: "transparent", border: 0, color: "var(--color-accent-700)", fontSize: 13.5, cursor: "pointer", textAlign: "center", padding: "6px 0 0" }}
        >
          {mode === "cook" ? t.managerSignIn : t.backToKitchenSignIn}
        </button>
      </div>
    </div>
  );
}

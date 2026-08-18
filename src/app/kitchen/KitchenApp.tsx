"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiRequestError,
  fetchCertificates,
  fetchLocations,
  fetchLogDefinitions,
  fetchLogEntry,
  fetchMe,
  fetchToday,
  logout,
  submitLogEntry,
} from "./api-client";
import {
  clearDraft,
  draftKey,
  listOutbox,
  loadDraft,
  queueOutbox,
  removeFromOutbox,
  saveDraft,
} from "./offline";
import type { CertificateStatus, Cook, Draft, Location, LogDefinition, LogEntryRecord, TodayResponse } from "./types";
import { emptyDraft } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";
import LoginScreen from "./LoginScreen";
import TodayTab from "./TodayTab";
import RecordsTab from "./RecordsTab";
import EntryFlow from "./EntryFlow";
import EntryDetail from "./EntryDetail";

const LOCATION_STORAGE_KEY = "kitchen.locationId";
const LANG_STORAGE_KEY = "kitchen.lang";

function todayBusinessDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

function initialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  return saved === "en" || saved === "es" ? saved : "en";
}

export default function KitchenApp() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [booted, setBooted] = useState(false);
  const [cook, setCook] = useState<Cook | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogDefinition[]>([]);
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [certificates, setCertificates] = useState<CertificateStatus[]>([]);
  const [tab, setTab] = useState<"today" | "records">("today");
  const [sitesOpen, setSitesOpen] = useState(false);
  const [flowLogId, setFlowLogId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [detailEntry, setDetailEntry] = useState<{ log: LogDefinition; entry: LogEntryRecord } | null>(null);
  const [toast, setToast] = useState("");
  const [pendingLogIds, setPendingLogIds] = useState<Set<string>>(new Set());
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = strings[lang];
  const businessDate = todayBusinessDate();

  const note = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }, []);

  const refreshTodayAndCerts = useCallback((locId: string) => {
    fetchToday(locId).then(setToday).catch(() => {});
    fetchCertificates(locId).then((r) => setCertificates(r.certificates)).catch(() => {});
  }, []);

  const flushOutbox = useCallback(async () => {
    const queued = await listOutbox();
    for (const item of queued) {
      try {
        await submitLogEntry(item.payload);
        await removeFromOutbox(item.id);
        setPendingLogIds((prev) => {
          const next = new Set(prev);
          next.delete(item.payload.logDefinitionId);
          return next;
        });
      } catch {
        break; // still offline (or a real error) — stop and retry next time
      }
    }
    if (locationId) refreshTodayAndCerts(locationId);
  }, [locationId, refreshTodayAndCerts]);

  // Boot: locations, session.
  useEffect(() => {
    Promise.all([fetchLocations(), fetchMe()])
      .then(([locRes, meRes]) => {
        setLocations(locRes.locations);
        setCook(meRes.cook);
        const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
        const scoped = meRes.cook?.locationIds ?? locRes.locations.map((l) => l.id);
        const initial = (saved && scoped.includes(saved) ? saved : scoped[0]) ?? locRes.locations[0]?.id ?? null;
        setLocationId(initial ?? null);
      })
      .finally(() => setBooted(true));
  }, []);

  // Load form definitions once.
  useEffect(() => {
    if (!cook) return;
    fetchLogDefinitions().then((r) => setLogs(r.logs)).catch(() => {});
  }, [cook]);

  // Load today + certificates whenever location changes; also outbox pending badges.
  useEffect(() => {
    if (!cook || !locationId) return;
    localStorage.setItem(LOCATION_STORAGE_KEY, locationId);
    refreshTodayAndCerts(locationId);
    listOutbox().then((entries) => {
      setPendingLogIds(new Set(entries.filter((e) => e.payload.locationId === locationId).map((e) => e.payload.logDefinitionId)));
    });
  }, [cook, locationId, refreshTodayAndCerts]);

  // Online/offline tracking + sync-on-reconnect.
  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      flushOutbox();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [flushOutbox]);

  function switchLang(next: Lang) {
    setLang(next);
    localStorage.setItem(LANG_STORAGE_KEY, next);
  }

  async function openFlow(logDefinitionId: string) {
    if (!locationId) return;
    const doneItem = today?.done.find((d) => d.logDefinitionId === logDefinitionId);
    const log = logs.find((l) => l.id === logDefinitionId);

    if (pendingLogIds.has(logDefinitionId)) {
      note(t.syncing);
      return;
    }
    if (doneItem && log) {
      try {
        const { entry } = await fetchLogEntry(doneItem.entryId);
        setDetailEntry({ log, entry });
      } catch {
        // offline and not yet cached — nothing more we can show right now
      }
      return;
    }
    const key = draftKey(locationId, logDefinitionId, businessDate);
    const saved = await loadDraft(key);
    setDraft(saved ?? emptyDraft());
    setFlowLogId(logDefinitionId);
  }

  function closeFlow() {
    setFlowLogId(null);
    setDraft(emptyDraft());
  }

  function changeDraft(next: Draft) {
    setDraft(next);
    if (locationId && flowLogId) {
      saveDraft(draftKey(locationId, flowLogId, businessDate), next);
    }
  }

  async function submitFlow() {
    if (!locationId || !flowLogId || !cook) return;
    const log = logs.find((l) => l.id === flowLogId);
    if (!log) return;

    const payload =
      log.kind === "temps"
        ? {
            locationId,
            logDefinitionId: flowLogId,
            businessDate,
            readings: log.units.flatMap((unit) =>
              (log.slots ?? []).map((_, slotIndex) => {
                const k = `${unit.id}|${slotIndex}`;
                const value = parseFloat((draft.vals[k] ?? "0").replace("−", "-"));
                const correctiveAction = draft.ca[k];
                return { logUnitId: unit.id, slotIndex, value, ...(correctiveAction ? { correctiveAction } : {}) };
              })
            ),
          }
        : {
            locationId,
            logDefinitionId: flowLogId,
            businessDate,
            itemChecks: log.items.map((item) => ({ logItemId: item.id, checked: !!draft.checks[item.id] })),
          };

    const key = draftKey(locationId, flowLogId, businessDate);

    try {
      await submitLogEntry(payload);
      await clearDraft(key);
      closeFlow();
      note(t.savedAndSigned(log.name));
      refreshTodayAndCerts(locationId);
    } catch (err) {
      const isServerRejection = err instanceof ApiRequestError && err.status < 500;
      if (isServerRejection) {
        note(err.message);
        return;
      }
      // Network failure (offline, or the request never reached the server) — queue it.
      await queueOutbox(payload);
      await clearDraft(key);
      setPendingLogIds((prev) => new Set(prev).add(flowLogId));
      setToday((prevToday) => {
        if (!prevToday) return prevToday;
        const stillTodo = prevToday.todo.filter((i) => i.logDefinitionId !== flowLogId);
        const already = prevToday.done.some((d) => d.logDefinitionId === flowLogId);
        return {
          ...prevToday,
          todo: stillTodo,
          done: already
            ? prevToday.done
            : [
                ...prevToday.done,
                {
                  logDefinitionId: flowLogId,
                  name: log.name,
                  entryId: `pending-${Date.now()}`,
                  submittedAt: new Date().toISOString(),
                  signatureName: cook.name,
                },
              ],
          doneCount: already ? prevToday.doneCount : prevToday.doneCount + 1,
        };
      });
      closeFlow();
      note(t.savedOffline(log.name));
    }
  }

  async function handleSignOut() {
    await logout().catch(() => {});
    setCook(null);
    setToday(null);
    setCertificates([]);
  }

  if (!booted) return null;

  if (!cook) {
    return (
      <LoginScreen
        locations={locations}
        lang={lang}
        onSignedIn={(signedInCook, signedInLocationId) => {
          setCook(signedInCook);
          setLocationId(signedInLocationId);
        }}
      />
    );
  }

  const scopedLocations = locations.filter((l) => (cook.locationIds ?? []).includes(l.id));
  const currentLocation = locations.find((l) => l.id === locationId);
  const flowLog = flowLogId ? logs.find((l) => l.id === flowLogId) : null;

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!online && <span style={{ fontSize: 12, color: "var(--color-alert)" }}>{t.offline}</span>}
            <button
              onClick={() => switchLang(lang === "en" ? "es" : "en")}
              style={{ background: "transparent", border: "1px solid var(--color-divider)", fontSize: 12, padding: "4px 8px", cursor: "pointer" }}
            >
              {lang === "en" ? "ES" : "EN"}
            </button>
          </div>
        </div>
        <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{dateLabel()}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {tab === "today" && today && (
          <TodayTab today={today} pendingLogIds={pendingLogIds} onOpen={openFlow} lang={lang} />
        )}
        {tab === "records" && locationId && (
          <RecordsTab locationId={locationId} logs={logs} certificates={certificates} lang={lang} />
        )}
      </div>

      <div style={{ flex: "none", display: "flex", borderTop: "1px solid var(--color-divider)", padding: "0 0 26px" }}>
        <button
          onClick={() => setTab("today")}
          style={{ flex: 1, minHeight: 60, background: "transparent", border: 0, cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, letterSpacing: ".04em", color: tab === "today" ? "var(--color-accent)" : "var(--color-muted)" }}
        >
          {t.today}
        </button>
        <button
          onClick={() => setTab("records")}
          style={{ flex: 1, minHeight: 60, background: "transparent", border: 0, borderLeft: "1px solid var(--color-divider)", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, letterSpacing: ".04em", color: tab === "records" ? "var(--color-accent)" : "var(--color-muted)" }}
        >
          {t.records}
        </button>
      </div>

      {sitesOpen && (
        <div onClick={() => setSitesOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(43,43,45,.5)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-bg)", padding: "20px 20px 42px", display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 13, letterSpacing: ".1em", color: "var(--color-muted)" }}>{t.chooseKitchen}</span>
            {scopedLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  setLocationId(loc.id);
                  setSitesOpen(false);
                  closeFlow();
                }}
                style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 66, padding: "10px 14px", background: "transparent", border: "1px solid var(--color-divider)", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ width: 14, height: 14, flex: "none", background: loc.id === locationId ? "var(--color-accent)" : "transparent", border: "1px solid var(--color-accent)" }} />
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, flex: 1 }}>{loc.name}</span>
              </button>
            ))}
            <button onClick={handleSignOut} style={{ background: "transparent", border: 0, color: "var(--color-accent-700)", fontSize: 14, cursor: "pointer", textAlign: "left", padding: "8px 0 0" }}>
              {t.signOut}
            </button>
          </div>
        </div>
      )}

      {flowLog && locationId && (
        <EntryFlow
          log={flowLog}
          locationName={currentLocation?.name ?? ""}
          cookName={cook.name}
          draft={draft}
          onChangeDraft={changeDraft}
          onClose={closeFlow}
          onSubmit={submitFlow}
          lang={lang}
        />
      )}

      {detailEntry && <EntryDetail log={detailEntry.log} entry={detailEntry.entry} onClose={() => setDetailEntry(null)} lang={lang} />}

      {toast && (
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 104, padding: "14px 16px", background: "var(--color-accent-900)", color: "var(--color-bg)", zIndex: 90, fontSize: 14.5, lineHeight: 1.4 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

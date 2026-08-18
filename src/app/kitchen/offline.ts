import type { SubmitPayload } from "./api-client";
import type { Draft } from "./types";

// Minimal IndexedDB-backed offline store: drafts (in-progress form state,
// so a cook never loses work if the app is killed mid-shift) and an outbox
// of signed-but-not-yet-synced submissions (append-only, so there's nothing
// to reconcile on reconnect — just replay in order).

const DB_NAME = "kitchen-log";
const DB_VERSION = 1;
const DRAFTS_STORE = "drafts";
const OUTBOX_STORE = "outbox";

export type OutboxEntry = {
  id: number;
  payload: SubmitPayload;
  createdAt: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
          db.createObjectStore(DRAFTS_STORE);
        }
        if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
          db.createObjectStore(OUTBOX_STORE, { keyPath: "id", autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function draftKey(locationId: string, logDefinitionId: string, businessDate: string) {
  return `${locationId}|${logDefinitionId}|${businessDate}`;
}

export async function saveDraft(key: string, draft: Draft) {
  try {
    await tx<IDBValidKey>(DRAFTS_STORE, "readwrite", (s) => s.put(draft, key));
  } catch {
    // best-effort; a cook mid-entry shouldn't be blocked by storage errors
  }
}

export async function loadDraft(key: string): Promise<Draft | undefined> {
  try {
    return await tx<Draft | undefined>(DRAFTS_STORE, "readonly", (s) => s.get(key));
  } catch {
    return undefined;
  }
}

export async function clearDraft(key: string) {
  try {
    await tx<undefined>(DRAFTS_STORE, "readwrite", (s) => s.delete(key));
  } catch {
    // ignore
  }
}

export async function queueOutbox(payload: SubmitPayload): Promise<void> {
  await tx<IDBValidKey>(OUTBOX_STORE, "readwrite", (s) =>
    s.add({ payload, createdAt: new Date().toISOString() })
  );
}

export async function listOutbox(): Promise<OutboxEntry[]> {
  try {
    return await tx<OutboxEntry[]>(OUTBOX_STORE, "readonly", (s) => s.getAll());
  } catch {
    return [];
  }
}

export async function removeFromOutbox(id: number) {
  await tx<undefined>(OUTBOX_STORE, "readwrite", (s) => s.delete(id));
}

// True if this location/log/date has a submission still waiting to sync.
export function outboxHas(entries: OutboxEntry[], locationId: string, logDefinitionId: string, businessDate: string) {
  return entries.some(
    (e) =>
      e.payload.locationId === locationId &&
      e.payload.logDefinitionId === logDefinitionId &&
      e.payload.businessDate === businessDate
  );
}

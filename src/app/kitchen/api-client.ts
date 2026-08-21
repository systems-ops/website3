import type {
  CertificateStatus,
  Cook,
  Location,
  LogDefinition,
  LogEntryRecord,
  Manager,
  ProductionBatchRecord,
  ReceivedLot,
  TodayResponse,
} from "./types";

class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "same-origin",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError(res.status, body.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export { ApiRequestError };

export const fetchLocations = () => api<{ locations: Location[] }>("/api/locations");

export const fetchLogDefinitions = () => api<{ logs: LogDefinition[] }>("/api/log-definitions");

export const fetchToday = (locationId: string, date?: string) =>
  api<TodayResponse>(`/api/today?locationId=${locationId}${date ? `&date=${date}` : ""}`);

export const fetchCertificates = (locationId: string) =>
  api<{ certificates: CertificateStatus[] }>(`/api/certificates?locationId=${locationId}`);

export const fetchLogEntriesByMonth = (locationId: string, logDefinitionId: string, month: string) =>
  api<{ entries: LogEntryRecord[] }>(
    `/api/log-entries?locationId=${locationId}&logDefinitionId=${logDefinitionId}&month=${month}`
  );

export const fetchLogEntry = (id: string) => api<{ entry: LogEntryRecord }>(`/api/log-entries/${id}`);

export type SubmitPayload = {
  locationId: string;
  logDefinitionId: string;
  businessDate: string;
  readings?: { logUnitId: string; slotIndex: number; value: number; correctiveAction?: string }[];
  itemChecks?: { logItemId: string; status: "PASS" | "FAIL" | "NA"; statusNote?: string }[];
  lateReason?: string;
  calibrationRows?: { testTermId: string; referenceReading: number; testReading: number; comments?: string }[];
  receiving?: {
    invoiceNumber: string;
    distributorName: string;
    wfcfo: { approved: boolean; explain?: string };
    nonGmo: { approved: boolean; explain?: string };
    truckCondition: { approved: boolean; explain?: string };
    truckTempCompliant: boolean;
    truckTempF?: number;
    palletConditionGood: boolean;
    plasticWrapGood: boolean;
    productsToStandard: { approved: boolean; explain?: string };
    labelsCurrent: { approved: boolean; explain?: string };
    sealIntact: boolean;
    caseCountMatches: boolean;
    supplierPaperworkAttached: boolean;
    organicCertCurrent: boolean;
    lines: {
      productName: string;
      productId?: string;
      productCount?: string;
      lotNumber?: string;
      allergenProduct: boolean;
      labeledOrganic: boolean;
      storageType: "dry" | "refrig" | "freezer";
    }[];
  };
};

export const submitLogEntry = (payload: SubmitPayload) =>
  api<{ entry: LogEntryRecord }>("/api/log-entries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const login = (locationId: string, pin: string) =>
  api<{ cook: Cook }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ locationId, pin }),
  });

export const logout = () => api<{ ok: true }>("/api/auth/logout", { method: "POST" });

export const fetchMe = () => api<{ cook: Cook | null }>("/api/auth/me");

export const managerLogin = (pin: string) =>
  api<{ manager: Manager }>("/api/auth/manager-login", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });

export const managerLogout = () => api<{ ok: true }>("/api/auth/manager-logout", { method: "POST" });

export const fetchManagerMe = () => api<{ manager: Manager | null }>("/api/auth/manager-me");

export type ReceivingReviewPayload = {
  totalCount?: number;
  countTested?: number;
  standardsReviewed?: string;
  coaReference?: string;
  approved: boolean;
  rejectedReason?: string;
  storageLocation?: string;
  storageCcps?: string;
  comments?: string;
  releasedForUse: boolean;
};

export const submitReceivingReview = (entryId: string, payload: ReceivingReviewPayload) =>
  api(`/api/log-entries/${entryId}/receiving-review`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export type WeekSummary = {
  weekStart: string;
  days: string[];
  missingByLog: { logDefinitionId: string; name: string; daysMissing: string[] }[];
  outOfSpecCount: number;
  failedCount: number;
  lateCount: number;
  rejectedReceivingCount: number;
  verification: { id: string; verifiedAt: string; comments: string | null; manager: Manager } | null;
};

export const fetchVerifications = (locationId: string, weeks = 4) =>
  api<{ weeks: WeekSummary[] }>(`/api/verifications?locationId=${locationId}&weeks=${weeks}`);

export const submitVerification = (locationId: string, weekStart: string, comments?: string) =>
  api("/api/verifications", {
    method: "POST",
    body: JSON.stringify({ locationId, weekStart, ...(comments ? { comments } : {}) }),
  });

export const fetchRecentLots = (locationId: string) =>
  api<{ lots: ReceivedLot[] }>(`/api/batches/recent-lots?locationId=${locationId}`);

export const fetchBatchesByMonth = (locationId: string, month: string) =>
  api<{ batches: ProductionBatchRecord[] }>(`/api/batches?locationId=${locationId}&month=${month}`);

export type CreateBatchPayload = {
  locationId: string;
  businessDate: string;
  lateReason?: string;
  batchCode: string;
  productType: string;
  quantity?: string;
  inputs: { receivingLineId: string }[];
  outputs: {
    productName: string;
    quantity?: string;
    bakeDate: string;
    bestByDate?: string;
    disposition: "held" | "sold_in_store" | "shipped";
    reference?: string;
  }[];
};

export const createBatch = (payload: CreateBatchPayload) =>
  api<{ batch: ProductionBatchRecord }>("/api/batches", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export type TraceBatch = {
  id: string;
  batchCode: string;
  productType: string;
  quantity: string | null;
  businessDate: string;
  location: string;
  signatureName: string;
  producedAt: string;
  inputs: {
    productNameSnapshot: string;
    supplierLotNumber: string | null;
    distributorName: string;
    invoiceNumber: string;
    receivedDate: string;
  }[];
  outputs: {
    productName: string;
    quantity: string | null;
    bakeDate: string;
    bestByDate: string | null;
    disposition: string;
    reference: string | null;
  }[];
};

export const fetchTrace = (query: string, locationId?: string) =>
  api<{ batches: TraceBatch[] }>(
    `/api/trace?query=${encodeURIComponent(query)}${locationId ? `&locationId=${locationId}` : ""}`
  );

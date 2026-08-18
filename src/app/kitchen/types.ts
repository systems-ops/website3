export type Location = { id: string; name: string };

export type LogUnit = {
  id: string;
  name: string;
  low: number;
  high: number;
  sortOrder: number;
  unitOverride: string | null;
};

export type LogItem = { id: string; label: string; sortOrder: number };

export type LogDefinition = {
  id: string;
  name: string;
  formCode: string;
  kind: "temps" | "check";
  unit: "F" | "C" | null;
  slots: string[] | null;
  revision: number;
  units: LogUnit[];
  items: LogItem[];
  correctiveActions: string[];
};

export type TodayTodo = { logDefinitionId: string; name: string; kind: "temps" | "check"; sub: string };
export type TodayDone = {
  logDefinitionId: string;
  name: string;
  entryId: string;
  submittedAt: string;
  signatureName: string;
};

export type TodayResponse = {
  location: Location;
  businessDate: string;
  doneCount: number;
  totalCount: number;
  todo: TodayTodo[];
  done: TodayDone[];
};

export type CertificateStatus = { id: string; name: string; ok: boolean; status: string };

export type ReadingRecord = {
  id: string;
  logUnitId: string;
  slotIndex: number;
  value: number;
  outOfSpec: boolean;
  specLow: number;
  specHigh: number;
  specUnitOverride: string | null;
  correctiveAction: string | null;
  logUnit: LogUnit;
};

export type ItemCheckRecord = {
  id: string;
  logItemId: string;
  checked: boolean;
  logItem: LogItem;
};

export type LogEntryRecord = {
  id: string;
  locationId: string;
  logDefinitionId: string;
  businessDate: string;
  submittedAt: string;
  submittedBy: string;
  signatureName: string;
  amendsId: string | null;
  readings: ReadingRecord[];
  itemChecks: ItemCheckRecord[];
  logDefinition?: LogDefinition;
};

export type Cook = { id: string; name: string; locationIds?: string[] };

// Local draft state for an in-progress (unsubmitted) form, keyed by
// `${locationId}|${logDefinitionId}|${businessDate}`.
export type Draft = {
  vals: Record<string, string>; // key: `${logUnitId}|${slotIndex}` -> raw typed value
  checks: Record<string, boolean>; // key: logItemId -> checked
  ca: Record<string, string>; // key: `${logUnitId}|${slotIndex}` -> corrective action text
};

export const emptyDraft = (): Draft => ({ vals: {}, checks: {}, ca: {} });

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

export type LogKind = "temps" | "check" | "calibration" | "receiving";

export type LogDefinition = {
  id: string;
  name: string;
  formCode: string;
  kind: LogKind;
  unit: "F" | "C" | null;
  slots: string[] | null;
  revision: number;
  units: LogUnit[];
  items: LogItem[];
  correctiveActions: string[];
};

export type TodayTodo = { logDefinitionId: string; name: string; kind: LogKind; sub: string };
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

export type CheckStatus = "PASS" | "FAIL" | "NA";

export type ItemCheckRecord = {
  id: string;
  logItemId: string;
  status: CheckStatus;
  statusNote: string | null;
  logItem: LogItem;
};

export type CalibrationRowRecord = {
  id: string;
  rowIndex: number;
  testTermId: string;
  referenceReading: number;
  testReading: number;
  adjustmentRequired: boolean;
  comments: string | null;
};

export type ApprovalField = { approved: boolean; explain?: string };
export type StorageType = "dry" | "refrig" | "freezer";

export type ReceivingLineRecord = {
  id: string;
  rowIndex: number;
  productName: string;
  productId: string | null;
  productCount: string | null;
  lotNumber: string | null;
  allergenProduct: boolean;
  labeledOrganic: boolean;
  storageType: StorageType;
};

export type ReceivingDetailRecord = {
  invoiceNumber: string;
  distributorName: string;
  wfcfoApproved: boolean;
  wfcfoExplain: string | null;
  nonGmoApproved: boolean;
  nonGmoExplain: string | null;
  truckConditionGood: boolean;
  truckConditionExplain: string | null;
  truckTempCompliant: boolean;
  truckTempF: number | null;
  palletConditionGood: boolean;
  plasticWrapGood: boolean;
  productsToStandard: boolean;
  productsToStandardExplain: string | null;
  labelsCurrent: boolean;
  labelsCurrentExplain: string | null;
  sealIntact: boolean;
  caseCountMatches: boolean;
  supplierPaperworkAttached: boolean;
  organicCertCurrent: boolean;
  lines: ReceivingLineRecord[];
};

export type ReceivingReviewRecord = {
  id: string;
  manager: Manager;
  reviewedAt: string;
  totalCount: number | null;
  countTested: number | null;
  standardsReviewed: string | null;
  coaReference: string | null;
  approved: boolean;
  rejectedReason: string | null;
  storageLocation: string | null;
  storageCcps: string | null;
  comments: string | null;
  releasedForUse: boolean;
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
  enteredLate: boolean;
  lateReason: string | null;
  amendReason: string | null;
  readings: ReadingRecord[];
  itemChecks: ItemCheckRecord[];
  calibrationRows: CalibrationRowRecord[];
  receivingDetail: ReceivingDetailRecord | null;
  receivingReview: ReceivingReviewRecord | null;
  amendments?: LogEntryRecord[];
  logDefinition?: LogDefinition;
};

export type Cook = { id: string; name: string; locationIds?: string[] };

export type Manager = { id: string; name: string; role: string };

// A single in-progress row on a "calibration" form (thermometer ID, the two
// readings, and a comment if they're out of tolerance).
export type CalibrationDraftRow = {
  testTermId: string;
  referenceReading: string;
  testReading: string;
  comments: string;
};

export type ReceivingLineDraft = {
  productName: string;
  productId: string;
  productCount: string;
  lotNumber: string;
  allergenProduct: boolean;
  labeledOrganic: boolean;
  storageType: StorageType;
};

export type ReceivingDraft = {
  invoiceNumber: string;
  distributorName: string;
  wfcfo: ApprovalField;
  nonGmo: ApprovalField;
  truckCondition: ApprovalField;
  truckTempCompliant: boolean;
  truckTempF: string;
  palletConditionGood: boolean;
  plasticWrapGood: boolean;
  productsToStandard: ApprovalField;
  labelsCurrent: ApprovalField;
  sealIntact: boolean;
  caseCountMatches: boolean;
  supplierPaperworkAttached: boolean;
  organicCertCurrent: boolean;
  lines: ReceivingLineDraft[];
};

export const emptyReceivingDraft = (): ReceivingDraft => ({
  invoiceNumber: "",
  distributorName: "",
  wfcfo: { approved: true },
  nonGmo: { approved: true },
  truckCondition: { approved: true },
  truckTempCompliant: true,
  truckTempF: "",
  palletConditionGood: true,
  plasticWrapGood: true,
  productsToStandard: { approved: true },
  labelsCurrent: { approved: true },
  sealIntact: true,
  caseCountMatches: true,
  supplierPaperworkAttached: true,
  organicCertCurrent: true,
  lines: [],
});

export type ReceivedLot = {
  receivingLineId: string;
  productName: string;
  lotNumber: string | null;
  distributorName: string;
  receivedDate: string;
};

export type BatchDisposition = "held" | "sold_in_store" | "shipped";

export type BatchInputRecord = {
  id: string;
  receivingLineId: string;
  productNameSnapshot: string;
  supplierLotNumber: string | null;
};

export type BatchOutputRecord = {
  id: string;
  productName: string;
  quantity: string | null;
  bakeDate: string;
  bestByDate: string | null;
  disposition: BatchDisposition;
  reference: string | null;
};

export type ProductionBatchRecord = {
  id: string;
  locationId: string;
  businessDate: string;
  batchCode: string;
  productType: string;
  quantity: string | null;
  producedAt: string;
  submittedBy: string;
  signatureName: string;
  enteredLate: boolean;
  lateReason: string | null;
  inputs: BatchInputRecord[];
  outputs: BatchOutputRecord[];
};

export type BatchOutputDraft = {
  productName: string;
  quantity: string;
  bakeDate: string;
  bestByDate: string;
  disposition: BatchDisposition;
  reference: string;
};

// Local draft state for an in-progress (unsubmitted) form, keyed by
// `${locationId}|${logDefinitionId}|${businessDate}`.
export type Draft = {
  vals: Record<string, string>; // key: `${logUnitId}|${slotIndex}` -> raw typed value
  checks: Record<string, CheckStatus>; // key: logItemId -> PASS/FAIL/NA (absent = not yet answered)
  checkNotes: Record<string, string>; // key: logItemId -> corrective action (FAIL) or reason (NA)
  ca: Record<string, string>; // key: `${logUnitId}|${slotIndex}` -> corrective action text
  calibrationRows: CalibrationDraftRow[];
  receiving: ReceivingDraft;
};

export const emptyDraft = (): Draft => ({
  vals: {},
  checks: {},
  checkNotes: {},
  ca: {},
  calibrationRows: [],
  receiving: emptyReceivingDraft(),
});

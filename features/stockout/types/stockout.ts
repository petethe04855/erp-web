export type BoxKind = "flavor" | "item";

/** One tile on the count screen, mapped to an ERP SKU. */
export interface StockOutBox {
  skuId: number;
  name: string;
  kind: BoxKind;
  /** Boxes sharing a group are also totalled together (e.g. wand heads). */
  group: string;
  unit: string;
  color: string;
  image: string;
  lowStock: number;
}

export interface StockOutConfig {
  warehouseId: number;
  boxes: StockOutBox[];
  countRoles: string[];
  voidRoles: string[];
}

export interface StockOutConfigView {
  config: StockOutConfig;
  skuCodes: Record<string, string>;
  updatedAt: string | null;
  updatedBy: string;
}

export interface ActiveLot {
  lotId: number;
  lotNumber: string;
  expiry: string;
  left: number;
}

export interface BoxSummary extends StockOutBox {
  skuCode: string;
  missing?: boolean;
  outToday: number;
  onHand: number;
  low: boolean;
  lot: ActiveLot | null;
}

export interface StockOutSummary {
  date: string;
  warehouseId: number;
  boxes: BoxSummary[];
  pendingReview: number;
  asOf: string;
}

export interface LotTake {
  lotId: number;
  lotNumber: string;
  expiry: string;
  qty: number;
}

export interface StockOutLine {
  skuId: number;
  skuCode: string;
  name: string;
  group: string;
  qty: number;
  deducted: number;
  short: number;
  lots: LotTake[];
}

export type BatchStatus = "queued" | "posted" | "voided" | "needs_review";

export interface StockOutBatch {
  id: number;
  batchNo: string;
  clientId: string;
  warehouseId: number;
  userId: number;
  userName: string;
  lines: StockOutLine[];
  totalQty: number;
  status: Exclude<BatchStatus, "queued">;
  voidedAt: string | null;
  voidedBy: string;
  reviewedAt: string | null;
  reviewedBy: string;
  reviewNote: string;
  countedAt: string;
  createdAt: string;
}

export interface HistoryRow {
  date: string;
  skuId: number;
  qty: number;
}

export interface CreateBatchDTO {
  clientId: string;
  createdAt: string;
  lines: { skuId: number; qty: number }[];
}

/** Count quantities of this round, keyed by SKU id. */
export type Round = Record<number, number>;

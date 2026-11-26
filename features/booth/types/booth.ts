export type BoothKind = "flavor" | "item";
export type BoothPayMethod = "cash" | "transfer" | "card";

export interface BoothFlavor {
  skuId: number;
  name: string;
  color: string;
}

export interface BoothSet {
  size: number;
  price: number;
}

export interface BoothItem {
  skuId: number;
  name: string;
  price: number;
}

export interface BoothDiscount {
  enabled: boolean;
  min: number;
  type: "baht" | "percent";
  value: number;
}

export interface BoothConfig {
  warehouseId: number;
  flavors: BoothFlavor[];
  sets: BoothSet[];
  items: BoothItem[];
  discount: BoothDiscount;
}

/** One product button with the stock the inventory has right now. */
export interface BoothButton {
  skuId: number;
  skuCode: string;
  name: string;
  kind: BoothKind;
  color?: string;
  price?: number;
  available: number;
  missing?: boolean;
}

export interface BoothCatalog {
  config: BoothConfig;
  buttons: BoothButton[];
  updatedAt: string | null;
  updatedBy: string;
}

export interface BoothLot {
  lotId: number;
  lotNumber: string;
  qty: number;
}

export interface BoothSaleLine {
  skuId: number;
  skuCode: string;
  name: string;
  kind: BoothKind;
  qty: number;
  unitPrice: number;
  amount: number;
  lots: BoothLot[];
}

export interface BoothTreatPart {
  size: number;
  count: number;
  unitPrice: number;
}

export interface BoothSale {
  id: number;
  saleNo: string;
  clientRef: string;
  warehouseId: number;
  sellerId: number;
  sellerName: string;
  lines: BoothSaleLine[];
  bags: number;
  treatLabel: string;
  treatParts: BoothTreatPart[];
  treatTotal: number;
  itemsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: BoothPayMethod;
  cashReceived: number;
  change: number;
  status: "completed" | "voided";
  voidedAt: string | null;
  voidedBy: string;
  voidReason: string;
  createdAt: string;
}

export interface BoothCartLineDTO {
  skuId: number;
  qty: number;
}

export interface CreateBoothSaleDTO {
  clientRef: string;
  lines: BoothCartLineDTO[];
  paymentMethod: BoothPayMethod;
  cashReceived?: number;
  expectedTotal: number;
}

export interface BoothSaleResult {
  sale: BoothSale;
  replayed: boolean;
}

/** Cart quantities keyed by SKU id. */
export type BoothCart = Record<number, number>;

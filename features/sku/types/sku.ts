export interface BundleItem {
  id: number | string;
  skuId: number | string;
  componentSku: string;
  componentName: string;
  quantity: number;
}

export interface SKUAccessory {
  id?: number;
  sku?: string;
  accessorySku: string;
  quantity: number;
  note?: string;
  name?: string;
}

export interface SKU {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  isBundle: boolean;
  stockQuantity?: number;
  availableStock?: number;
  reservedStock?: number;
  onHand?: number;
  reserved?: number;
  used?: number;
  usedQty?: number;
  available?: number;
  reorder?: number;
  bundleAvailable?: number;
  bundleItems?: BundleItem[];
  accessories?: SKUAccessory[];
  status: string;
  image?: string;
  createdAt?: string;
  lastReceivedAt?: string | null;
  receiptCount?: number;
  updatedAt?: string;
}

export interface SKUReceiptHistory {
  id: number;
  receivedAt: string;
  sourceType: "INITIAL_STOCK" | "GOODS_RECEIVE" | "STOCK_ADJUSTMENT_IN" | string;
  quantity: number;
  warehouseId: number;
  warehouseName?: string;
  lotNumber?: string;
  supplierLot?: string;
  expiryDate?: string | null;
  referenceType: string;
  referenceId: string;
  purchaseOrderRef?: string;
  note?: string;
}


export interface SKUQueryParams {
  search?: string;
  category?: string;
  isBundle?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateSKUDTO {
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  isBundle: boolean;
  image?: string;
  initialQuantity?: number;
  bundleItems?: Array<{
    componentSku: string;
    quantity: number;
  }>;
  accessories?: Array<{
    accessorySku: string;
    quantity: number;
    note?: string;
  }>;
}

export interface UpdateSKUDTO {
  sku?: string;
  name: string;
  category?: string;
  price: number;
  cost: number;
  isBundle?: boolean;
  image?: string;
  status?: string;
  bundleItems?: Array<{
    componentSku: string;
    quantity: number;
  }>;
  accessories?: Array<{
    accessorySku: string;
    quantity: number;
    note?: string;
  }>;
}

export interface StockAdjustmentDTO {
  sku: string;
  warehouse: string;
  type: string;
  quantity: number;
  reason: string;
}

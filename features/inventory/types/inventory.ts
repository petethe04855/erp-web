export interface InventoryStock {
  id: number;
  sku: string;
  productName: string;
  image?: string;
  category?: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  available: number;
  isActive?: boolean;
  stockStatus: "out" | "low" | "healthy";
}

export interface InventoryQueryParams {
  search?: string;
  warehouse?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface StockAdjustmentDTO {
  sku: string;
  warehouse: string;
  type: string;
  quantity: number;
  reason: string;
}

export interface StockBySKU {
  skuId: number;
  skuCode: string;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  warehouseCount: number;
}


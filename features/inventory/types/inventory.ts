export interface InventoryStock {
  id: number;
  sku: string;
  productName: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  available: number;
  safetyStock: number;
  safetyStockPercent?: string;
  isBundle?: boolean;
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

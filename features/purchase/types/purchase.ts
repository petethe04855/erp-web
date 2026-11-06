export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status: string;
}

export interface PurchaseQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreatePurchaseDTO {
  supplierName: string;
  expectedDeliveryDays: number;
  items: Array<{
    sku: string;
    quantity: number;
    unitCost: number;
  }>;
}

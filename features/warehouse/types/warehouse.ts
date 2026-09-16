export interface GoodsReceiveRecord {
  id: number;
  grnNumber: string;
  poNumber: string;
  receivedDate: string;
}

export interface GoodsIssueRecord {
  id: number;
  issueNumber: string;
  orderNumber?: string;
  reason: string;
  warehouse: string;
  issuedDate: string;
  totalItems: number;
}

export interface GoodsReceiveQueryParams {
  search?: string;
  warehouse?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GoodsIssueQueryParams {
  search?: string;
  reason?: string;
  page?: number;
  limit?: number;
}

export interface CreateGoodsReceiveDTO {
  poNumber: string;
  warehouse: string;
  sku: string;
  quantity: number;
  lotNumber: string;
  receiveDate: string;
  expiryDate: string;
}

export interface CreateGoodsIssueDTO {
  reason: string;
  orderNumber?: string;
  warehouse: string;
  sku: string;
  quantity: number;
}

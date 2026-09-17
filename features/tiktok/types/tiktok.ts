export interface TikTokConnection {
  connected: boolean;
  sellerName?: string;
  sellerBaseRegion?: string;
  shopCipher?: string;
  shopId?: string;
  shopName?: string;
  grantedScopes?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  needsReauthorization?: boolean;
}

export interface TikTokOrderItem {
  id: string | number;
  orderId: string | number;
  tiktokItemId?: string;
  skuId?: string;
  sellerSku?: string;
  productName: string;
  skuName?: string;
  quantity: number;
  originalPrice?: number;
  salePrice: number;
  erpSku?: string;
  isBundle?: boolean;
}

export interface TikTokOrder {
  id: string | number;
  tiktokOrderId: string;
  orderStatus: string;
  buyerUid?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress: string;
  recipientCity: string;
  recipientProvince: string;
  recipientPostalCode: string;
  totalAmount: number;
  shippingFee: number;
  paymentMethod: string;
  paidTime?: string;
  rtsTime?: string;
  deliveryOption: string;
  shippingProvider: string;
  trackingNumber: string;
  stockDeducted: boolean;
  stockDeductionStatus: "PENDING" | "DEDUCTED" | "FAILED" | "NOT_REQUIRED";
  stockDeductionError?: string;
  orderCreatedAt?: string;
  orderUpdatedAt?: string;
  items: TikTokOrderItem[];
}

export interface TikTokOrderQueryParams {
  search?: string;
  status?: string;
  stockStatus?: string;
  page?: number;
  limit?: number;
}

export interface TikTokSyncResult {
  synced: number;
  stockDeducted: number;
  stockDeductionErrors?: string[];
  stockDeductionWarnings?: string[];
}

export interface SKUMapping {
  id: number;
  tiktokSku: string;
  tiktokProductName?: string;
  tiktokSkuName?: string;
  erpSku: string;
  ratio: number;
  createdAt?: string;
}

export interface TikTokSyncRun {
  id: number;
  startedAt: string;
  finishedAt?: string;
  status: string;
  days: number;
  synced: number;
  stockDeducted: number;
  error?: string;
}

export interface SyncLog {
  id: number;
  orderNo: string;
  status: string;
  message: string;
  createdAt: string;
}

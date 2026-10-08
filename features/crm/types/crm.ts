export interface TiktokProvinceSummary {
  totalOrders: number;
  totalItemQty: number;
  grossSales: number;
  provinceCount: number;
  topProvince: string;
  dataCompletenessPercent: number;
}

export interface TiktokProvinceRow {
  province: string;
  orderCount: number;
  itemQty: number;
  grossSales: number;
  sharePercent: number;
}

export interface TiktokProvinceReport {
  summary: TiktokProvinceSummary;
  provinces: TiktokProvinceRow[];
}

export interface ProvinceQueryParams {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  province?: string;
  /** "all" (default) | "tiktok" | "shopee" */
  channel?: string;
}

export interface ProvinceSearchRequest {
  province?: string[];
  channel?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
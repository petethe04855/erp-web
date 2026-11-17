export interface TiktokProvinceSummary {
  totalOrders: number;
  totalItemQty: number;
  grossSales: number;
  provinceCount: number;
  topProvince: string;
  dataCompletenessPercent: number;
  avgOrderValue: number;
  totalProvinces: number;
  coveragePercent: number;
}

export interface TiktokProvinceRow {
  province: string;
  orderCount: number;
  itemQty: number;
  grossSales: number;
  sharePercent: number;
  salesSharePercent: number;
  avgOrderValue: number;
  region: string;
}

export interface ProvinceRegionRow {
  region: string;
  provinceCount: number;
  orderCount: number;
  grossSales: number;
  sharePercent: number;
}

export interface TiktokProvinceReport {
  summary: TiktokProvinceSummary;
  provinces: TiktokProvinceRow[];
  regions: ProvinceRegionRow[];
  trend: SalesTrend;
}

export interface SalesTrendPoint {
  /** "2026-W14" (weekly) or "2026-03" (monthly) */
  period: string;
  startDate: string;
  endDate: string;
  shopeeSales: number;
  tiktokSales: number;
  totalSales: number;
  shopeeOrders: number;
  tiktokOrders: number;
  totalOrders: number;
}

export interface SalesTrend {
  weekly: SalesTrendPoint[];
  monthly: SalesTrendPoint[];
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
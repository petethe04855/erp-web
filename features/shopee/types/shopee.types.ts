export interface DuplicateDetail {
  identifier: string;
  row_index: number;
  duplicate_type: "FILE_DUPLICATE" | "DB_EXISTING";
  message: string;
}

export interface ShopeeOrderItem {
  id?: number;
  order_id: string;
  sku: string;
  product_name: string;
  qty: number;
  sale_price: number;
  original_sku?: string;
  sku_confirmed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ShopeeOrder {
  id: string;
  order_date: string;
  buyer_username?: string;
  province?: string;
  status: string;
  row_hash: string;
  items: ShopeeOrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ShopeeIncome {
  id: number;
  order_id: string;
  order_date?: string;
  transfer_date: string;
  net_amount: number;
  row_hash: string;
  is_matched?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderPreviewResult {
  total_rows: number;
  total_orders: number;
  blank_sku_count: number;
  duplicate_count?: number;
  duplicate_orders?: string[];
  duplicate_details?: DuplicateDetail[];
  sample_rows: ShopeeOrderItem[];
  sample_orders: ShopeeOrder[];
}

export interface OrderImportResult {
  inserted_count: number;
  skipped_count: number;
  total_rows: number;
  duplicate_count?: number;
  duplicate_orders?: string[];
  duplicate_details?: DuplicateDetail[];
}

export interface IncomePreviewResult {
  total_rows: number;
  total_net_amount: number;
  duplicate_count?: number;
  duplicate_orders?: string[];
  duplicate_details?: DuplicateDetail[];
  sample_rows: ShopeeIncome[];
}

export interface IncomeImportResult {
  inserted_count: number;
  skipped_count: number;
  total_rows: number;
  total_amount: number;
  duplicate_count?: number;
  duplicate_orders?: string[];
  duplicate_details?: DuplicateDetail[];
}

export interface MatchingItemRow {
  item_id: number;
  order_id: string;
  order_date: string;
  transfer_date: string;
  sku: string;
  product_name: string;
  qty: number;
  effective_cost: number;
  total_cost: number;
  line_sale: number;
  order_gross: number;
  order_net: number;
  allocated_fee: number;
  allocated_net: number;
  profit: number;
  margin_pct: number;
  status: "OK" | "MISSING_COST" | "MISSING_ORDER" | "NEGATIVE_PROFIT";
}

export interface MonthlySummary {
  month: string;
  order_count: number;
  item_count: number;
  gross_sale: number;
  platform_fees: number;
  net_receive: number;
  total_cost: number;
  net_profit: number;
  profit_margin_pct: number;
}

export interface TopSKUStat {
  sku: string;
  product_name: string;
  total_qty: number;
  total_gross: number;
  total_cost: number;
  net_profit: number;
  margin_pct: number;
}

export interface DashboardAnalyticsResult {
  from_month: string;
  to_month: string;
  ytd_summary: MonthlySummary;
  monthly_trends: MonthlySummary[];
  top_skus: TopSKUStat[];
}

export interface SKUCostHistory {
  id: number;
  sku: string;
  cost_price: number;
  effective_from: string;
  effective_to?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

/** Shopee sales insights (by order date, Chawy shop only). Mirrors erp-api `/shopee/insights/*`. */

export interface InsightMeta {
  from: string;
  to: string;
  orders_scanned: number;
  unnamed_orders: number;
  /** Sister-shop (แม่เพิ่ม) orders left out. */
  excluded_orders: number;
  generated_at: string;
}

export interface InsightKPI {
  total_sales: number;
  orders: number;
  customers: number;
  aov: number;
  repeat_customers: number;
  repeat_pct: number;
  repeat_sales_pct: number;
  median_gap_days: number | null;
  last_month: string;
  prev_month: string;
  last_sales: number;
  prev_sales: number;
  mom_pct: number | null;
}

export interface InsightMonth {
  month: string;
  sales: number;
  orders: number;
  new_customers: number;
  repeat_orders: number;
}

export interface InsightSummary {
  meta: InsightMeta;
  kpi: InsightKPI;
  monthly: InsightMonth[];
}

export interface InsightProduct {
  category: string;
  product: string;
  sku: string;
  orders: number;
  qty: number;
  sales: number;
}

export interface InsightProducts {
  meta: InsightMeta;
  categories: string[];
  monthly_category: { month: string; category: string; sales: number }[];
  products: InsightProduct[] | null;
}

export interface InsightSets {
  meta: InsightMeta;
  set_sizes: number[] | null;
  monthly_sets: { month: string; set: number; sets_sold: number; sales: number }[] | null;
  bags_per_order: { bags: string; orders: number; sales: number }[];
  unresolved_lines: number;
}

export interface InsightCustomers {
  meta: InsightMeta;
  frequency: { purchases: number; customers: number; sales: number }[] | null;
  repeat_gap: {
    median_days: number | null;
    weeks: { week: string; customers: number; cum_pct: number }[];
  };
}

export interface InsightJourneyLink {
  from_order: number;
  from: string;
  to_order: number;
  to: string;
  customers: number;
}

export interface InsightJourney {
  meta: InsightMeta;
  steps: number;
  nodes: string[] | null;
  links: InsightJourneyLink[] | null;
}

export interface InsightRange {
  from: string;
  to: string;
}

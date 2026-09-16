export interface RevenueRow {
  date: string;
  reference: string;
  customer: string;
  channel: string;
  amount: number;
}
export interface RevenueReport {
  rows: RevenueRow[];
  total: number;
  byChannel: Record<string, number>;
}
export interface FinancialSummary {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  damageLoss: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}
export interface InventoryValuation {
  totalQty: number;
  totalValue: number;
  rows: {
    SKU: string;
    ProductName: string;
    Lot: string;
    ExpiryDate: string;
    RemainingQty: number;
    UnitCost: number;
    Value: number;
  }[];
}
export interface DashboardData {
  revenue: RevenueReport;
  financial: FinancialSummary;
  inventory: InventoryValuation;
}

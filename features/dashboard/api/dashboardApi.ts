import { read } from "@/lib/api";
import type {
  RevenueReport,
  FinancialSummary,
  InventoryValuation,
  DashboardData,
} from "../types/dashboard";
export const dashboardApi = {
  get: async (month: string): Promise<DashboardData> => {
    const [revenue, financial, inventory] = await Promise.all([
      read<RevenueReport>("/reports/revenue", { month }),
      read<FinancialSummary>("/reports/financial-summary", { month }),
      read<InventoryValuation>("/reports/inventory-valuation"),
    ]);
    return { revenue, financial, inventory };
  },
};

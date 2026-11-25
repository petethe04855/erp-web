import { read } from "@/lib/api";
import type {
  RevenueReport,
  FinancialSummary,
  InventoryValuation,
  MonthReport,
} from "../types/dashboard";
export const dashboardApi = {
  /** Revenue rows and accounting summary of one month (YYYY-MM). */
  getMonth: async (month: string): Promise<MonthReport> => {
    const [revenue, financial] = await Promise.all([
      read<RevenueReport>("/reports/revenue", { month }),
      read<FinancialSummary>("/reports/financial-summary", { month }),
    ]);
    return { revenue, financial };
  },
  /** Current stock valuation (not tied to a period). */
  getInventory: () => read<InventoryValuation>("/reports/inventory-valuation"),
};

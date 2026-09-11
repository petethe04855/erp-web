import api from "@/lib/axios";
import { read, writeRecord, deleteRecord, cleanParams } from "@/lib/api";
import type { ApiListResponse } from "@/types/api";
import type {
  JournalEntry,
  JournalQueryParams,
  Expense,
  ExpenseQueryParams,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  GeneralLedgerRow,
  TrialBalanceRow,
  ProfitAndLossReport,
  RevenueByChannelReport,
} from "../types/finance";

export const financeApi = {
  // Journal
  getJournalEntries: async (params?: JournalQueryParams): Promise<ApiListResponse<JournalEntry>> => {
    const res = await api.get<ApiListResponse<JournalEntry>>("/finance/journal-entries", {
      params: cleanParams(params),
    });
    return res.data;
  },

  getJournalEntryById: async (id: number): Promise<JournalEntry> => {
    return read<JournalEntry>(`/finance/journal-entries/${id}`);
  },

  // Expenses
  getExpenses: async (params?: ExpenseQueryParams): Promise<ApiListResponse<Expense>> => {
    const res = await api.get<ApiListResponse<Expense>>("/finance/expenses", {
      params: cleanParams(params),
    });
    return res.data;
  },

  createExpense: async (data: CreateExpenseDTO): Promise<Expense> => {
    const res = await writeRecord<Expense>("/finance/expenses", data, "post");
    return res.data;
  },

  updateExpense: async (id: number, data: UpdateExpenseDTO): Promise<Expense> => {
    const res = await writeRecord<Expense>(`/finance/expenses/${id}`, data, "put");
    return res.data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    await deleteRecord(`/finance/expenses/${id}`);
  },

  // Reports
  getGeneralLedger: async (params?: { from?: string; to?: string; account_id?: number }): Promise<GeneralLedgerRow[]> => {
    return read<GeneralLedgerRow[]>("/finance/reports/general-ledger", cleanParams(params));
  },

  getTrialBalance: async (params?: { from?: string; to?: string }): Promise<TrialBalanceRow[]> => {
    return read<TrialBalanceRow[]>("/finance/reports/trial-balance", cleanParams(params));
  },

  getProfitAndLoss: async (params?: { from?: string; to?: string; channel?: string }): Promise<ProfitAndLossReport> => {
    return read<ProfitAndLossReport>("finance/reports/pnl", cleanParams(params));
  },

  getRevenueByChannel: async (params?: { from?: string; to?: string }): Promise<RevenueByChannelReport> => {
    return read<RevenueByChannelReport>("/finance/reports/revenue-by-channel", cleanParams(params));
  },

  // Excel Exports (blob download)
  downloadExport: async (endpoint: string, filename: string, params?: object) => {
    const res = await api.get(endpoint, {
      params: cleanParams(params),
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
};

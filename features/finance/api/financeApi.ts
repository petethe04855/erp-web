import api from "@/lib/axios";
import { read, writeRecord, cleanParams } from "@/lib/api";
import type { ApiListResponse } from "@/types/api";
import type {
  JournalEntry,
  JournalQueryParams,
  Expense,
  ExpenseQueryParams,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ReceiptScanResult,
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

  /** Source expense of a journal entry, looked up by its code (journal source_ref). */
  getExpenseByCode: async (code: string): Promise<Expense> => {
    return read<Expense>(`/finance/expenses/by-code/${encodeURIComponent(code)}`);
  },

  createExpense: async (data: CreateExpenseDTO): Promise<Expense> => {
    const res = await writeRecord<Expense>("/finance/expenses", data, "post");
    return res.data;
  },

  updateExpense: async (id: number, data: UpdateExpenseDTO): Promise<Expense> => {
    const res = await writeRecord<Expense>(`/finance/expenses/${id}`, data, "put");
    return res.data;
  },

  /**
   * Void (cancel) an expense. The backend reverses its journal entry and keeps
   * the record with status "Voided" — expenses are never hard-deleted.
   */
  voidExpense: async (id: number, reason?: string): Promise<void> => {
    await api.delete(`/finance/expenses/${id}`, { data: { reason: reason || "" } });
  },

  /**
   * Fetch a protected payment slip with the user's auth token and return a
   * blob: URL for <img>. Slips are not served from the public /uploads route.
   */
  getSlipObjectUrl: async (slipApiPath: string): Promise<string> => {
    const res = await api.get<Blob>(slipApiPath, { responseType: "blob" });
    return URL.createObjectURL(res.data);
  },

  uploadSlip: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post<{
      success: boolean;
      data: { url: string };
      message?: string;
    }>("/upload/image?folder=expenses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res.data?.success || !res.data?.data?.url) {
      throw new Error(res.data?.message || "อัปโหลดสลิปไม่สำเร็จ");
    }
    return res.data.data.url;
  },

  scanReceipt: async (file: File): Promise<ReceiptScanResult> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post<{
      success: boolean;
      data: ReceiptScanResult;
      message?: string;
    }>("/finance/expenses/scan-receipt", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 90000, // 90 seconds for AI image processing
    });
    if (!res.data?.success || !res.data?.data) {
      throw new Error(res.data?.message || "สแกนใบเสร็จไม่สำเร็จ");
    }
    return res.data.data;
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

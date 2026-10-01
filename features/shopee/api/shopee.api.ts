import api from "@/lib/axios";
import { read, readWithMeta, deleteRecord } from "@/lib/api";
import type {
  ShopeeOrder,
  ShopeeIncome,
  OrderPreviewResult,
  OrderImportResult,
  IncomePreviewResult,
  IncomeImportResult,
  MatchingItemRow,
  MonthlySummary,
  DashboardAnalyticsResult,
  SKUCostHistory,
} from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";

export const shopeeApi = {
  // Orders
  previewOrders: async (file: File): Promise<OrderPreviewResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/shopee/orders/preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  importOrders: async (file: File): Promise<OrderImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/shopee/orders/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  getOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ data: ShopeeOrder[]; meta?: ApiPaginationMeta }> => {
    return readWithMeta<ShopeeOrder[]>("/shopee/orders", params);
  },

  getOrderByID: async (id: string): Promise<ShopeeOrder> => {
    return read<ShopeeOrder>(`/shopee/orders/${id}`);
  },

  updateItemSKU: async (itemId: number, sku: string): Promise<void> => {
    await api.patch(`/shopee/orders/items/${itemId}/sku`, { sku });
  },

  deleteOrder: async (id: string): Promise<void> => {
    await deleteRecord(`/shopee/orders/${id}`);
  },

  // Income
  previewIncome: async (file: File): Promise<IncomePreviewResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/shopee/income/preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  importIncome: async (file: File): Promise<IncomeImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/shopee/income/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  getIncomes: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ data: ShopeeIncome[]; meta?: ApiPaginationMeta }> => {
    return readWithMeta<ShopeeIncome[]>("/shopee/income", params);
  },

  deleteIncome: async (id: number): Promise<void> => {
    await deleteRecord(`/shopee/income/${id}`);
  },

  // Matching
  getMatching: async (
    month: string,
  ): Promise<{ summary: MonthlySummary; items: MatchingItemRow[] }> => {
    return read<{ summary: MonthlySummary; items: MatchingItemRow[] }>(
      "/shopee/matching",
      { month },
    );
  },

  exportMatchingCSV: async (month: string): Promise<Blob> => {
    const res = await api.get(`/shopee/matching/export?month=${month}`, {
      responseType: "blob",
    });
    return res.data;
  },

  // Dashboard
  getDashboard: async (from?: string, to?: string): Promise<DashboardAnalyticsResult> => {
    return read<DashboardAnalyticsResult>("/shopee/dashboard", { from, to });
  },

  // SKU Cost History
  getCostHistory: async (sku: string): Promise<SKUCostHistory[]> => {
    return read<SKUCostHistory[]>(`/skus/${encodeURIComponent(sku)}/cost-history`);
  },

  addCostHistory: async (
    sku: string,
    payload: {
      cost_price: number;
      effective_from: string;
      effective_to?: string;
      note?: string;
    },
  ): Promise<SKUCostHistory> => {
    const res = await api.post(
      `/skus/${encodeURIComponent(sku)}/cost-history`,
      payload,
    );
    return res.data.data;
  },

  deleteCostHistory: async (id: number): Promise<void> => {
    await deleteRecord(`/skus/cost-history/${id}`);
  },
};

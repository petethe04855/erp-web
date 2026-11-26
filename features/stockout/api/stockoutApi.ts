import apiClient from "@/lib/axios";
import { read, writeRecord } from "@/lib/api";
import type {
  CreateBatchDTO,
  HistoryRow,
  StockOutBatch,
  StockOutConfig,
  StockOutConfigView,
  StockOutSummary,
} from "../types/stockout";

/**
 * The server answered with an error (validation, permission). A batch that
 * gets one will not succeed by sending it again, unlike a dropped connection.
 */
export class RejectedError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}

export const stockoutApi = {
  getConfig: () => read<StockOutConfigView>("/stock-outs/config"),

  saveConfig: async (config: StockOutConfig) =>
    (await writeRecord<StockOutConfigView>("/stock-outs/config", config, "put")).data,

  summary: (date: string) => read<StockOutSummary>("/stock/summary", { date }),

  list: (date: string) => read<StockOutBatch[]>("/stock-outs", { date }),

  history: (from: string, to: string) => read<HistoryRow[]>("/stock-outs/history", { from, to }),

  /**
   * Sends one batch. Throws RejectedError when the server refuses it; any
   * other throw means it never arrived (offline, timeout) and is safe to send
   * again with the same clientId.
   */
  create: async (dto: CreateBatchDTO): Promise<StockOutBatch> => {
    const res = await apiClient.post("/stock-outs", dto, { validateStatus: () => true });
    if (res.status >= 200 && res.status < 300 && res.data?.success) return res.data.data.batch;
    if (res.status === 401 || res.status >= 500) throw new Error("ERP ยังรับไม่ได้ (HTTP " + res.status + ")");
    const err = res.data?.error ?? {};
    throw new RejectedError(err.message || "ERP ไม่รับรอบนี้ (HTTP " + res.status + ")", res.status, err.code || "");
  },

  void: async (id: number): Promise<StockOutBatch> => {
    const res = await apiClient.post(`/stock-outs/${id}/void`, {}, { validateStatus: () => true });
    if (res.status >= 200 && res.status < 300 && res.data?.success) return res.data.data;
    if (res.status === 401 || res.status >= 500) throw new Error("ERP ยังรับไม่ได้ (HTTP " + res.status + ")");
    const err = res.data?.error ?? {};
    throw new RejectedError(err.message || "ยกเลิกไม่ได้", res.status, err.code || "");
  },

  review: async (id: number, note: string) =>
    (await writeRecord<StockOutBatch>(`/stock-outs/${id}/review`, { note })).data,

  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("image", file);
    const res = await apiClient.post("/upload/image", form, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data?.data?.url as string;
  },
};

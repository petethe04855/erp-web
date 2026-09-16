import { read, list, writeRecord } from "@/lib/api";
import type { ApiListResponse } from "@/types/api";

/** อัปโหลดรูปยืนยันสภาพสินค้า (ใช้ endpoint กลางเดียวกับรูป SKU) */
export async function uploadEvidenceImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const axios = (await import("@/lib/axios")).default;
  const res = await axios.post<{
    success: boolean;
    data: { url: string };
    message?: string;
  }>("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.data?.success || !res.data?.data?.url) {
    throw new Error(res.data?.message || "อัปโหลดรูปภาพไม่สำเร็จ");
  }
  return res.data.data.url;
}
import type {
  SalesReturn,
  ReturnableItem,
  CreateReturnDTO,
  UpdateReturnDTO,
  CompleteReturnDTO,
} from "../types/return";

export const returnApi = {
  getReturns: (params?: {
    search?: string;
    status?: string;
    return_type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiListResponse<SalesReturn>> => {
    return list<SalesReturn, SalesReturn>("/returns", params, (r) => r);
  },

  getReturnByID: (id: number | string): Promise<SalesReturn> => {
    return read<SalesReturn>(`/returns/${id}`);
  },

  getOrderReturnable: (orderId: number | string): Promise<ReturnableItem[]> => {
    return read<ReturnableItem[]>(`/orders/${orderId}/returnable`);
  },

  createReturn: (dto: CreateReturnDTO) => {
    return writeRecord<SalesReturn>("/returns", dto, "post");
  },

  updateReturn: (id: number | string, dto: UpdateReturnDTO) => {
    return writeRecord<SalesReturn>(`/returns/${id}`, dto, "put");
  },

  submitReturn: (id: number | string) => {
    return writeRecord<SalesReturn>(`/returns/${id}/submit`, {}, "post");
  },

  approveReturn: (id: number | string) => {
    return writeRecord<SalesReturn>(`/returns/${id}/approve`, {}, "post");
  },

  rejectReturn: (id: number | string, reason: string) => {
    return writeRecord<SalesReturn>(`/returns/${id}/reject`, { reason }, "post");
  },

  cancelReturn: (id: number | string, reason: string) => {
    return writeRecord<SalesReturn>(`/returns/${id}/cancel`, { reason }, "post");
  },

  completeReturn: (id: number | string, dto: CompleteReturnDTO) => {
    return writeRecord<SalesReturn>(`/returns/${id}/complete`, dto, "post");
  },
};

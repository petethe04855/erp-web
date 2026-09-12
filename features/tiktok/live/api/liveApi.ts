import { read, writeRecord, deleteRecord } from "@/lib/api";
import type {
  LiveSession,
  PayrollSummary,
  ContentItem,
  CreateLiveSessionDTO,
  UpdateLiveSessionDTO,
  CreateContentItemDTO,
  UpdateContentItemDTO,
  RoundingPolicy,
} from "../types/live";
import type { ApiListResponse } from "@/types/api";

export const liveApi = {
  // Live Sessions
  getSessions: (params?: {
    month?: string;
    status?: string;
    platform?: string;
    staff_id?: number;
    page?: number;
    limit?: number;
  }) => {
    return read<LiveSession[]>("/live/sessions", params);
  },

  getSessionByID: (id: number) => {
    return read<LiveSession>(`/live/sessions/${id}`);
  },

  createSession: (dto: CreateLiveSessionDTO) => {
    return writeRecord<LiveSession>("/live/sessions", dto, "post");
  },

  updateSession: (id: number, dto: UpdateLiveSessionDTO) => {
    return writeRecord<LiveSession>(`/live/sessions/${id}`, dto, "put");
  },

  approveSession: (id: number) => {
    return writeRecord<LiveSession>(`/live/sessions/${id}/approve`, {}, "post");
  },

  rejectSession: (id: number, reason: string) => {
    return writeRecord<LiveSession>(`/live/sessions/${id}/reject`, { reason }, "post");
  },

  // Payroll Summary
  getPayrollSummary: (params: { month: string; rounding?: RoundingPolicy }) => {
    return read<PayrollSummary>("/live/payroll", params);
  },

  // Content Items
  getContentItems: (params?: { kind?: string; platform?: string; page?: number; limit?: number }) => {
    return read<ContentItem[]>("/live/content", params);
  },

  createContentItem: (dto: CreateContentItemDTO) => {
    return writeRecord<ContentItem>("/live/content", dto, "post");
  },

  updateContentItem: (id: number, dto: UpdateContentItemDTO) => {
    return writeRecord<ContentItem>(`/live/content/${id}`, dto, "put");
  },

  deleteContentItem: (id: number) => {
    return deleteRecord<void>(`/live/content/${id}`);
  },
};

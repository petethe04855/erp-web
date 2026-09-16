import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveApi } from "../api/liveApi";
import type {
  CreateLiveSessionDTO,
  UpdateLiveSessionDTO,
  CreateContentItemDTO,
  UpdateContentItemDTO,
  RoundingPolicy,
} from "../types/live";

export const LIVE_QUERY_KEYS = {
  all: ["live"] as const,
  sessions: (params?: object) => ["live", "sessions", params] as const,
  session: (id: number) => ["live", "session", id] as const,
  payroll: (params?: object) => ["live", "payroll", params] as const,
  content: (params?: object) => ["live", "content", params] as const,
};

export function useLiveSessions(params?: {
  month?: string;
  status?: string;
  platform?: string;
  staff_id?: number;
}) {
  return useQuery({
    queryKey: LIVE_QUERY_KEYS.sessions(params),
    queryFn: () => liveApi.getSessions(params),
    staleTime: 30 * 1000,
  });
}

export function useLivePayroll(params: { month: string; rounding?: RoundingPolicy }, enabled = true) {
  return useQuery({
    queryKey: LIVE_QUERY_KEYS.payroll(params),
    queryFn: () => liveApi.getPayrollSummary(params),
    enabled: enabled && !!params.month,
    staleTime: 30 * 1000,
  });
}

export function useContentItems(params?: { kind?: string; platform?: string }) {
  return useQuery({
    queryKey: LIVE_QUERY_KEYS.content(params),
    queryFn: () => liveApi.getContentItems(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateLiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLiveSessionDTO) => liveApi.createSession(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.all });
    },
  });
}

export function useUpdateLiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateLiveSessionDTO }) =>
      liveApi.updateSession(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.all });
    },
  });
}

export function useApproveLiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => liveApi.approveSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.all });
    },
  });
}

export function useRejectLiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      liveApi.rejectSession(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.all });
    },
  });
}

export function useCreateContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateContentItemDTO) => liveApi.createContentItem(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.content() });
    },
  });
}

export function useUpdateContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateContentItemDTO }) =>
      liveApi.updateContentItem(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.content() });
    },
  });
}

export function useDeleteContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => liveApi.deleteContentItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVE_QUERY_KEYS.content() });
    },
  });
}

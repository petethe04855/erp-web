import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { returnApi } from "../api/returnApi";
import type {
  CreateReturnDTO,
  UpdateReturnDTO,
  CompleteReturnDTO,
} from "../types/return";

export const RETURN_KEYS = {
  all: ["returns"] as const,
  list: (params?: object) => [...RETURN_KEYS.all, "list", params] as const,
  detail: (id?: number | string) => [...RETURN_KEYS.all, "detail", id] as const,
  orderReturnable: (orderId?: number | string) =>
    [...RETURN_KEYS.all, "orderReturnable", orderId] as const,
};

export function useReturnsQuery(params?: {
  search?: string;
  status?: string;
  return_type?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: RETURN_KEYS.list(params),
    queryFn: () => returnApi.getReturns(params),
    staleTime: 15 * 1000,
  });
}

export function useReturnQuery(id?: number | string) {
  return useQuery({
    queryKey: RETURN_KEYS.detail(id),
    queryFn: () => (id ? returnApi.getReturnByID(id) : Promise.reject("No ID")),
    enabled: Boolean(id),
  });
}

export function useOrderReturnableQuery(orderId?: number | string) {
  return useQuery({
    queryKey: RETURN_KEYS.orderReturnable(orderId),
    queryFn: () => returnApi.getOrderReturnable(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useReturnMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: RETURN_KEYS.all });
    qc.invalidateQueries({ queryKey: ["inventory-stock-by-sku"] });
    qc.invalidateQueries({ queryKey: ["inventory-stocks"] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateReturnDTO) => returnApi.createReturn(dto),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number | string; dto: UpdateReturnDTO }) =>
      returnApi.updateReturn(id, dto),
    onSuccess: invalidate,
  });

  const submitMutation = useMutation({
    mutationFn: (id: number | string) => returnApi.submitReturn(id),
    onSuccess: invalidate,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number | string) => returnApi.approveReturn(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      returnApi.rejectReturn(id, reason),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      returnApi.cancelReturn(id, reason),
    onSuccess: invalidate,
  });

  const completeMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number | string;
      dto: CompleteReturnDTO;
    }) => returnApi.completeReturn(id, dto),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    submitMutation,
    approveMutation,
    rejectMutation,
    cancelMutation,
    completeMutation,
  };
}

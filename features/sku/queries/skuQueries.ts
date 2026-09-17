import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skuApi } from "../api/skuApi";
import { SKUQueryParams, CreateSKUDTO } from "../types/sku";

export const SKU_QUERY_KEYS = {
  all: ["skus"] as const,
  lists: () => [...SKU_QUERY_KEYS.all, "list"] as const,
  list: (params?: SKUQueryParams) =>
    [...SKU_QUERY_KEYS.lists(), params] as const,
  details: () => [...SKU_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number | string) => [...SKU_QUERY_KEYS.details(), id] as const,
  receipts: (skuId: number, params?: { page?: number; limit?: number; warehouseId?: number }) =>
    [...SKU_QUERY_KEYS.all, "receipts", skuId, params] as const,
  movements: (skuId: number, params?: { page?: number; limit?: number }) =>
    [...SKU_QUERY_KEYS.all, "movements", skuId, params] as const,
};

export function useSKUListQuery(params?: SKUQueryParams) {
  return useQuery({
    queryKey: SKU_QUERY_KEYS.list(params),
    queryFn: () => skuApi.getSKUs(params),
  });
}

export function useSKUReceiptsQuery(
  skuId: number,
  params?: { page?: number; limit?: number; warehouseId?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: SKU_QUERY_KEYS.receipts(skuId, params),
    queryFn: () => skuApi.getSKUReceipts(skuId, params),
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000,
  });
}

export function useSKUMovementsQuery(
  skuId: number,
  params?: { page?: number; limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: SKU_QUERY_KEYS.movements(skuId, params),
    queryFn: () => skuApi.getSKUMovements(skuId, params),
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000,
  });
}

export function useSKUDetailQuery(id: number | string) {
  return useQuery({
    queryKey: SKU_QUERY_KEYS.detail(id),
    queryFn: () => skuApi.getSKUById(id),
    enabled: !!id,
  });
}

export function useCreateSKUMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSKUDTO) => skuApi.createSKU(data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useUpdateSKUMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sku,
      data,
    }: {
      sku: string | number;
      data: import("../types/sku").UpdateSKUDTO;
    }) => skuApi.updateSKU(sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useUpdateSKUStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sku, status }: { sku: string | number; status: string }) =>
      skuApi.updateStatus(sku, status),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useDeleteSKUMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sku: string | number) => skuApi.deleteSKU(sku),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useAdjustSKUStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: import("../types/sku").StockAdjustmentDTO) => skuApi.adjustStock(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

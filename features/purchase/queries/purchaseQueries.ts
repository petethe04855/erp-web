import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseApi } from "../api/purchaseApi";
import { PurchaseQueryParams, CreatePurchaseDTO } from "../types/purchase";

export const PURCHASE_QUERY_KEYS = {
  all: ["purchase-orders"] as const,
  list: (params?: PurchaseQueryParams) =>
    [...PURCHASE_QUERY_KEYS.all, "list", params] as const,
};

export function usePurchaseListQuery(params?: PurchaseQueryParams) {
  return useQuery({
    queryKey: PURCHASE_QUERY_KEYS.list(params),
    queryFn: () => purchaseApi.getPurchaseOrders(params),
  });
}

export function useCreatePurchaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePurchaseDTO) =>
      purchaseApi.createPurchaseOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

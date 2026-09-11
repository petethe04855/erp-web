import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/orderApi";
import { OrderQueryParams, CreateOrderDTO } from "../types/order";

export const ORDER_QUERY_KEYS = {
  all: ["orders"] as const,
  list: (params?: OrderQueryParams) =>
    [...ORDER_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string | number) =>
    [...ORDER_QUERY_KEYS.all, "detail", String(id)] as const,
};

export function useOrderListQuery(params?: OrderQueryParams) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: () => orderApi.getOrders(params),
  });
}

export function useOrderDetailQuery(id: string | number) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(id),
    queryFn: () => orderApi.getOrderByID(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string | number; status: string; note?: string }) =>
      orderApi.updateStatus(id, status, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useCreateInvoiceFromSOMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (soRef: string | number) => orderApi.createInvoiceFromSO(soRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDTO) => orderApi.createOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
    },
  });
}

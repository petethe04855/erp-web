import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/orderApi";
import { OrderQueryParams, CreateOrderDTO } from "../types/order";

export const ORDER_QUERY_KEYS = {
  all: ["orders"] as const,
  list: (params?: OrderQueryParams) =>
    [...ORDER_QUERY_KEYS.all, "list", params] as const,
};

export function useOrderListQuery(params?: OrderQueryParams) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: () => orderApi.getOrders(params),
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDTO) => orderApi.createOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

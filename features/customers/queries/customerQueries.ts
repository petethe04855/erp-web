import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../api/customerApi";
import { CustomerQueryParams, CreateCustomerDTO } from "../types/customer";

export const CUSTOMER_QUERY_KEYS = {
  all: ["customers"] as const,
  list: (params?: CustomerQueryParams) =>
    [...CUSTOMER_QUERY_KEYS.all, "list", params] as const,
};

export function useCustomerListQuery(params?: CustomerQueryParams) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.list(params),
    queryFn: () => customerApi.getCustomers(params),
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDTO) => customerApi.createCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

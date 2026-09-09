import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api/quotationApi";
import { QuotationQueryParams, CreateQuotationDTO } from "../types/quotation";

export const QUOTATION_QUERY_KEYS = {
  all: ["quotations"] as const,
  list: (params?: QuotationQueryParams) =>
    [...QUOTATION_QUERY_KEYS.all, "list", params] as const,
};

export function useQuotationListQuery(params?: QuotationQueryParams) {
  return useQuery({
    queryKey: QUOTATION_QUERY_KEYS.list(params),
    queryFn: () => quotationApi.getQuotations(params),
  });
}

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuotationDTO) => quotationApi.createQuotation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

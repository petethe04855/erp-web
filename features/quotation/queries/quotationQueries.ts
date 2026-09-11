import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api/quotationApi";
import { QuotationQueryParams, CreateQuotationDTO } from "../types/quotation";

export const QUOTATION_QUERY_KEYS = {
  all: ["quotations"] as const,
  list: (params?: QuotationQueryParams) =>
    [...QUOTATION_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string | number) =>
    [...QUOTATION_QUERY_KEYS.all, "detail", String(id)] as const,
};

export function useQuotationListQuery(params?: QuotationQueryParams) {
  return useQuery({
    queryKey: QUOTATION_QUERY_KEYS.list(params),
    queryFn: () => quotationApi.getQuotations(params),
  });
}

export function useQuotationDetailQuery(id: string | number) {
  return useQuery({
    queryKey: QUOTATION_QUERY_KEYS.detail(id),
    queryFn: () => quotationApi.getQuotationByID(id),
    enabled: !!id,
  });
}

export function useUpdateQuotationStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      quotationApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useConvertQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => quotationApi.convertQuotation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuotationDTO) => quotationApi.createQuotation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
    },
  });
}

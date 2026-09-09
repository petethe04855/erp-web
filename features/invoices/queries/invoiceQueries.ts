import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "../api/invoiceApi";
import { InvoiceQueryParams, CreateInvoiceDTO } from "../types/invoice";

export const INVOICE_QUERY_KEYS = {
  all: ["invoices"] as const,
  list: (params?: InvoiceQueryParams) =>
    [...INVOICE_QUERY_KEYS.all, "list", params] as const,
};

export function useInvoiceListQuery(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.list(params),
    queryFn: () => invoiceApi.getInvoices(params),
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDTO) => invoiceApi.createInvoice(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

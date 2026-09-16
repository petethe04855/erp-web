import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "../api/invoiceApi";
import { InvoiceQueryParams, CreateInvoiceDTO } from "../types/invoice";

export const INVOICE_QUERY_KEYS = {
  all: ["invoices"] as const,
  list: (params?: InvoiceQueryParams) =>
    [...INVOICE_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string | number) =>
    [...INVOICE_QUERY_KEYS.all, "detail", String(id)] as const,
};

export function useInvoiceListQuery(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.list(params),
    queryFn: () => invoiceApi.getInvoices(params),
  });
}

export function useInvoiceDetailQuery(id: string | number) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.detail(id),
    queryFn: () => invoiceApi.getInvoiceByID(id),
    enabled: !!id,
  });
}

export function usePayInvoiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string | number; amount: number }) =>
      invoiceApi.payInvoice(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDTO) => invoiceApi.createInvoice(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.all });
    },
  });
}

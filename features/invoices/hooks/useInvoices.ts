"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useInvoiceListQuery,
  useCreateInvoiceMutation,
} from "../queries/invoiceQueries";
import { InvoiceQueryParams, CreateInvoiceDTO } from "../types/invoice";

export function useInvoices() {
  const { filters, setFilters, query } = useFilters<InvoiceQueryParams>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useInvoiceListQuery(query);
  const createMutation = useCreateInvoiceMutation();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      page: 1,
      limit: 10,
    });
  };

  const createInvoice = async (dto: CreateInvoiceDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    invoices: data?.data || [],
    meta: data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isError,
    filters,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createInvoice,
    isCreating: createMutation.isPending,
  };
}

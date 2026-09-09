"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useQuotationListQuery,
  useCreateQuotationMutation,
} from "../queries/quotationQueries";
import { QuotationQueryParams, CreateQuotationDTO } from "../types/quotation";

export function useQuotation() {
  const { filters, setFilters, query } = useFilters<QuotationQueryParams>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useQuotationListQuery(query);
  const createMutation = useCreateQuotationMutation();

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

  const createQuotation = async (dto: CreateQuotationDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    quotations: data?.data || [],
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
    createQuotation,
    isCreating: createMutation.isPending,
  };
}

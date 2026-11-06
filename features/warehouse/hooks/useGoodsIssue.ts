"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useGoodsIssueListQuery,
  useCreateGoodsIssueMutation,
} from "../queries/warehouseQueries";
import { GoodsIssueQueryParams, CreateGoodsIssueDTO } from "../types/warehouse";

export function useGoodsIssue() {
  const { filters, setFilters, query } = useFilters<GoodsIssueQueryParams>({
    search: "",
    reason: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useGoodsIssueListQuery(query);
  const createMutation = useCreateGoodsIssueMutation();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleReasonChange = (reason: string) => {
    setFilters((prev) => ({ ...prev, reason, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters({ search: "", reason: "all", page: 1, limit: 10 });
  };

  const createIssue = async (dto: CreateGoodsIssueDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    issues: data?.data || [],
    meta: data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isError,
    filters,
    handleSearch,
    handleReasonChange,
    handlePageChange,
    resetFilters,
    refetch,
    createIssue,
    isCreating: createMutation.isPending,
  };
}

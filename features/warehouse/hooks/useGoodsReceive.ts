"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useGoodsReceiveListQuery,
  useCreateGoodsReceiveMutation,
} from "../queries/warehouseQueries";
import {
  GoodsReceiveQueryParams,
  CreateGoodsReceiveDTO,
} from "../types/warehouse";

export function useGoodsReceive() {
  const { filters, setFilters, query } = useFilters<GoodsReceiveQueryParams>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useGoodsReceiveListQuery(query);
  const createMutation = useCreateGoodsReceiveMutation();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "all", page: 1, limit: 10 });
  };

  const createReceive = async (dto: CreateGoodsReceiveDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    receives: data?.data || [],
    meta: data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isError,
    filters,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    resetFilters,
    refetch,
    createReceive,
    isCreating: createMutation.isPending,
  };
}

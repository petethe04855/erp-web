"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useSKUListQuery,
  useCreateSKUMutation,
  useUpdateSKUMutation,
  useUpdateSKUStatusMutation,
  useDeleteSKUMutation,
  useAdjustSKUStockMutation,
} from "../queries/skuQueries";
import { SKUQueryParams, CreateSKUDTO, UpdateSKUDTO, StockAdjustmentDTO } from "../types/sku";

export function useSKU() {
  const { filters, setFilters, query } = useFilters<SKUQueryParams>({
    search: "",
    category: "all",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useSKUListQuery(query);
  const createMutation = useCreateSKUMutation();
  const updateMutation = useUpdateSKUMutation();
  const updateStatusMutation = useUpdateSKUStatusMutation();
  const deleteMutation = useDeleteSKUMutation();
  const adjustMutation = useAdjustSKUStockMutation();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }));
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
      category: "all",
      status: "all",
      page: 1,
      limit: 10,
    });
  };

  const createSKU = async (dto: CreateSKUDTO) => {
    return createMutation.mutateAsync(dto);
  };

  const updateSKU = async (sku: string | number, dto: UpdateSKUDTO) => {
    return updateMutation.mutateAsync({ sku, data: dto });
  };

  const toggleSKUStatus = async (sku: string | number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    return updateStatusMutation.mutateAsync({ sku, status: nextStatus });
  };

  const deleteSKU = async (sku: string | number) => {
    return deleteMutation.mutateAsync(sku);
  };

  const adjustStock = async (dto: StockAdjustmentDTO) => {
    return adjustMutation.mutateAsync(dto);
  };

  return {
    skus: data?.data || [],
    meta: data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isError,
    filters,
    handleSearch,
    handleCategoryChange,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createSKU,
    updateSKU,
    toggleSKUStatus,
    deleteSKU,
    adjustStock,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAdjusting: adjustMutation.isPending,
  };
}

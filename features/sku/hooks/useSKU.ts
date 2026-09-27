"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useSKUListQuery,
  useCreateSKUMutation,
  useUpdateSKUMutation,
  useUpdateSKUStatusMutation,
  useDeleteSKUMutation,
  useAdjustSKUStockMutation,
  useImportSKUXLSMutation,
} from "../queries/skuQueries";
import { skuApi } from "../api/skuApi";
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
  const importMutation = useImportSKUXLSMutation();

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

  const toggleSKUStatus = async (sku: string | number, status: string) => {
    return updateStatusMutation.mutateAsync({ sku, status: status });
  };

  const deleteSKU = async (sku: string | number) => {
    return deleteMutation.mutateAsync(sku);
  };

  const adjustStock = async (dto: StockAdjustmentDTO) => {
    return adjustMutation.mutateAsync(dto);
  };

  const importSKU = async (file: File) => {
    return importMutation.mutateAsync(file);
  };

  const downloadTemplate = async () => {
    const blob = await skuApi.downloadTemplate();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sku_import_template.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
    importSKU,
    downloadTemplate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAdjusting: adjustMutation.isPending,
    isImporting: importMutation.isPending,
  };
}


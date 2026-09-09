"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useInventoryStocksQuery,
  useAdjustStockMutation,
} from "../queries/inventoryQueries";
import { InventoryQueryParams, StockAdjustmentDTO } from "../types/inventory";

export function useInventory() {
  const { filters, setFilters, query } = useFilters<InventoryQueryParams>({
    search: "",
    warehouse: "all",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useInventoryStocksQuery(query);
  const adjustMutation = useAdjustStockMutation();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleWarehouseChange = (warehouse: string) => {
    setFilters((prev) => ({ ...prev, warehouse, page: 1 }));
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
      warehouse: "all",
      status: "all",
      page: 1,
      limit: 10,
    });
  };

  const adjustStock = async (dto: StockAdjustmentDTO) => {
    return adjustMutation.mutateAsync(dto);
  };

  return {
    stocks: data?.data || [],
    meta: data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isError,
    filters,
    handleSearch,
    handleWarehouseChange,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    adjustStock,
    isAdjusting: adjustMutation.isPending,
  };
}

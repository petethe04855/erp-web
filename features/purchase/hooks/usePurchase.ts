"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  usePurchaseListQuery,
  useCreatePurchaseMutation,
} from "../queries/purchaseQueries";
import { PurchaseQueryParams, CreatePurchaseDTO } from "../types/purchase";

export function usePurchase() {
  const { filters, setFilters, query } = useFilters<PurchaseQueryParams>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = usePurchaseListQuery(query);
  const createMutation = useCreatePurchaseMutation();

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

  const createPurchaseOrder = async (dto: CreatePurchaseDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    purchaseOrders: data?.data || [],
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
    createPurchaseOrder,
    isCreating: createMutation.isPending,
  };
}

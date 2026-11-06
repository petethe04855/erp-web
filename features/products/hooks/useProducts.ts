"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useProductListQuery,
  useCreateProductMutation,
} from "../queries/productQueries";
import { ProductQueryParams, CreateProductDTO } from "../types/product";

export function useProducts() {
  const { filters, setFilters, query } = useFilters<ProductQueryParams>({
    search: "",
    category: "all",
    type: "all",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useProductListQuery(query);
  const createMutation = useCreateProductMutation();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }));
  };

  const handleTypeChange = (type: string) => {
    setFilters((prev) => ({ ...prev, type, page: 1 }));
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
      type: "all",
      status: "all",
      page: 1,
      limit: 10,
    });
  };

  const createProduct = async (dto: CreateProductDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    products: data?.data || [],
    meta: data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isError,
    filters,
    handleSearch,
    handleCategoryChange,
    handleTypeChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createProduct,
    isCreating: createMutation.isPending,
  };
}

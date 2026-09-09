"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useCustomerListQuery,
  useCreateCustomerMutation,
} from "../queries/customerQueries";
import { CustomerQueryParams, CreateCustomerDTO } from "../types/customer";

export function useCustomers() {
  const { filters, setFilters, query } = useFilters<CustomerQueryParams>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useCustomerListQuery(query);
  const createMutation = useCreateCustomerMutation();

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

  const createCustomer = async (dto: CreateCustomerDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    customers: data?.data || [],
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
    createCustomer,
    isCreating: createMutation.isPending,
  };
}

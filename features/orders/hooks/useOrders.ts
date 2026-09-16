"use client";

import { useFilters } from "@/hooks/useFilters";
import {
  useOrderListQuery,
  useCreateOrderMutation,
} from "../queries/orderQueries";
import { OrderQueryParams, CreateOrderDTO } from "../types/order";

export function useOrders() {
  const { filters, setFilters, query } = useFilters<OrderQueryParams>({
    search: "",
    fulfillmentStatus: "all",
    paymentStatus: "all",
    channel: "all",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useOrderListQuery(query);
  const createMutation = useCreateOrderMutation();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFulfillmentChange = (fulfillmentStatus: string) => {
    setFilters((prev) => ({ ...prev, fulfillmentStatus, page: 1 }));
  };

  const handlePaymentChange = (paymentStatus: string) => {
    setFilters((prev) => ({ ...prev, paymentStatus, page: 1 }));
  };

  const handleChannelChange = (channel: string) => {
    setFilters((prev) => ({ ...prev, channel, page: 1 }));
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
      fulfillmentStatus: "all",
      paymentStatus: "all",
      channel: "all",
      page: 1,
      limit: 10,
    });
  };

  const createOrder = async (dto: CreateOrderDTO) => {
    return createMutation.mutateAsync(dto);
  };

  return {
    orders: data?.data || [],
    meta: data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isError,
    filters,
    handleSearch,
    handleFulfillmentChange,
    handlePaymentChange,
    handleChannelChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createOrder,
    isCreating: createMutation.isPending,
  };
}

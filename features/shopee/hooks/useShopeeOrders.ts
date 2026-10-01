import { useState, useEffect, useCallback } from "react";
import { shopeeApi } from "../api/shopee.api";
import type { ShopeeOrder } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";

export function useShopeeOrders(initialParams?: {
  page?: number;
  limit?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}) {
  const [orders, setOrders] = useState<ShopeeOrder[]>([]);
  const [meta, setMeta] = useState<ApiPaginationMeta | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(initialParams?.page || 1);
  const [limit, setLimit] = useState<number>(initialParams?.limit || 10);
  const [search, setSearch] = useState<string>(initialParams?.search || "");
  const [startDate, setStartDate] = useState<string>(initialParams?.start_date || "");
  const [endDate, setEndDate] = useState<string>(initialParams?.end_date || "");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shopeeApi.getOrders({
        page,
        limit,
        search: search || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setOrders(res.data || []);
      setMeta(res.meta);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load Shopee orders";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    meta,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refetch: fetchOrders,
  };
}

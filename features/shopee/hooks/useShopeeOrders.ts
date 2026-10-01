import { useState, useEffect, useCallback } from "react";
import { shopeeApi } from "../api/shopee.api";
import type { ShopeeOrder } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";
import { THAI_PROVINCE_OPTIONS } from "@/constants/provinces";

export function useShopeeOrders(initialParams?: {
  page?: number;
  limit?: number;
  search?: string;
  province?: string;
  provider?: string;
  start_date?: string;
  end_date?: string;
}) {
  const [orders, setOrders] = useState<ShopeeOrder[]>([]);
  const [meta, setMeta] = useState<ApiPaginationMeta | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);

  const [page, setPage] = useState<number>(initialParams?.page || 1);
  const [limit, setLimit] = useState<number>(initialParams?.limit || 10);
  const [search, setSearch] = useState<string>(initialParams?.search || "");
  const [province, setProvince] = useState<string>(
    initialParams?.province || initialParams?.provider || ""
  );
  const [startDate, setStartDate] = useState<string>(initialParams?.start_date || "");
  const [endDate, setEndDate] = useState<string>(initialParams?.end_date || "");

  // Load distinct provinces with orders from database
  const fetchProvinces = useCallback(async () => {
    try {
      const data = await shopeeApi.getOrderProvinces();
      setAvailableProvinces(data || []);
    } catch {
      // Ignore error, fallback to static if needed
    }
  }, []);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shopeeApi.getOrders({
        page,
        limit,
        search: search || undefined,
        province: province || undefined,
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
  }, [page, limit, search, province, startDate, endDate]);

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
    province,
    setProvince,
    provider: province,
    setProvider: setProvince,
    provinces: availableProvinces,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refetch: fetchOrders,
    refetchProvinces: fetchProvinces,
  };
}

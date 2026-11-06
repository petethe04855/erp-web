import { useState, useEffect, useCallback } from "react";
import { shopeeApi } from "../api/shopee.api";
import type { ShopeeIncome } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";

export function useShopeeIncome(initialParams?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}) {
  const [incomes, setIncomes] = useState<ShopeeIncome[]>([]);
  const [meta, setMeta] = useState<ApiPaginationMeta | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(initialParams?.page || 1);
  const [limit, setLimit] = useState<number>(initialParams?.limit || 10);
  const [search, setSearch] = useState<string>(initialParams?.search || "");
  const [status, setStatus] = useState<string>(initialParams?.status || "all");
  const [startDate, setStartDate] = useState<string>(initialParams?.start_date || "");
  const [endDate, setEndDate] = useState<string>(initialParams?.end_date || "");

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shopeeApi.getIncomes({
        page,
        limit,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setIncomes(res.data || []);
      setMeta(res.meta);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load Shopee income";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, startDate, endDate]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return {
    incomes,
    meta,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refetch: fetchIncomes,
  };
}

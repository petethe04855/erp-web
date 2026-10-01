import { useState, useEffect, useCallback, useMemo } from "react";
import { shopeeApi } from "../api/shopee.api";
import type { MatchingItemRow, MonthlySummary } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";

export function useShopeeMatching(initialMonth?: string) {
  const defaultMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const [month, setMonth] = useState<string>(initialMonth || defaultMonth());
  const [items, setItems] = useState<MatchingItemRow[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const fetchMatching = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    setError(null);
    try {
      const res = await shopeeApi.getMatching(month);
      setItems(res.items || []);
      setSummary(res.summary);
      setPage(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load matching";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchMatching();
  }, [fetchMatching]);

  const meta: ApiPaginationMeta = useMemo(() => {
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      page,
      limit,
      total,
      totalPages,
    };
  }, [items.length, page, limit]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [items, page, limit]);

  const exportCSV = useCallback(async () => {
    if (!month) return;
    try {
      const blob = await shopeeApi.exportMatchingCSV(month);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shopee_matching_${month.replace("-", "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      console.error("Export CSV failed", err);
    }
  }, [month]);

  return {
    month,
    setMonth,
    items,
    paginatedItems,
    meta,
    summary,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    refetch: fetchMatching,
    exportCSV,
  };
}

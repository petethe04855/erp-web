import { useState, useEffect, useCallback } from "react";
import { shopeeApi } from "../api/shopee.api";
import type { MatchingItemRow, MonthlySummary } from "../types/shopee.types";

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

  const fetchMatching = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    setError(null);
    try {
      const res = await shopeeApi.getMatching(month);
      setItems(res.items || []);
      setSummary(res.summary);
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
    summary,
    loading,
    error,
    refetch: fetchMatching,
    exportCSV,
  };
}

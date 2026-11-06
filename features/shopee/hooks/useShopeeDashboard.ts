import { useState, useEffect, useCallback } from "react";
import { shopeeApi } from "../api/shopee.api";
import type { DashboardAnalyticsResult } from "../types/shopee.types";

export type ShopeeDashboardPreset = "current" | "3m" | "6m" | "ytd" | "custom";

export function useShopeeDashboard(initialFrom?: string, initialTo?: string) {
  const getCurrentYearMonth = (offsetMonths = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offsetMonths);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const currentYM = getCurrentYearMonth(0);

  // Default to CURRENT month for both from and to
  const [fromMonth, setFromMonth] = useState<string>(initialFrom || currentYM);
  const [toMonth, setToMonth] = useState<string>(initialTo || currentYM);
  const [preset, setPreset] = useState<ShopeeDashboardPreset>("current");

  const [data, setData] = useState<DashboardAnalyticsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!fromMonth || !toMonth) return;
    setLoading(true);
    setError(null);
    try {
      const res = await shopeeApi.getDashboard(fromMonth, toMonth);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [fromMonth, toMonth]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Set a specific single month
  const selectSingleMonth = useCallback((ym: string) => {
    setPreset(ym === currentYM ? "current" : "custom");
    setFromMonth(ym);
    setToMonth(ym);
  }, [currentYM]);

  // Shift single month previous or next
  const shiftMonth = useCallback(
    (offset: number) => {
      // Parse from current fromMonth
      const [yStr, mStr] = (fromMonth || currentYM).split("-");
      const d = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1 + offset, 1);
      const newY = d.getFullYear();
      const newM = String(d.getMonth() + 1).padStart(2, "0");
      const newYM = `${newY}-${newM}`;
      selectSingleMonth(newYM);
    },
    [fromMonth, currentYM, selectSingleMonth]
  );

  // Apply Range Presets
  const applyPreset = useCallback(
    (newPreset: ShopeeDashboardPreset) => {
      setPreset(newPreset);
      const d = new Date();
      const currentYear = d.getFullYear();
      const currentMonth = currentYM;

      if (newPreset === "current") {
        setFromMonth(currentMonth);
        setToMonth(currentMonth);
      } else if (newPreset === "3m") {
        setFromMonth(getCurrentYearMonth(-2));
        setToMonth(currentMonth);
      } else if (newPreset === "6m") {
        setFromMonth(getCurrentYearMonth(-5));
        setToMonth(currentMonth);
      } else if (newPreset === "ytd") {
        setFromMonth(`${currentYear}-01`);
        setToMonth(currentMonth);
      }
    },
    [currentYM]
  );

  return {
    fromMonth,
    setFromMonth: (val: string) => {
      setPreset("custom");
      setFromMonth(val);
    },
    toMonth,
    setToMonth: (val: string) => {
      setPreset("custom");
      setToMonth(val);
    },
    preset,
    applyPreset,
    selectSingleMonth,
    shiftMonth,
    isCurrentMonth: fromMonth === currentYM && toMonth === currentYM,
    isSingleMonth: fromMonth === toMonth,
    currentYM,
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

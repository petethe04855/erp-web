import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import { mergeMonthReports } from "../lib/metrics";
import type { DashboardData } from "../types/dashboard";

const LIVE_REFRESH = 60_000;
const PAST_REFRESH = 5 * 60_000;

/**
 * Dashboard data for one or more months (a single month, or each month of a
 * year), merged into one report. Each month is its own cached query, so
 * switching between month and year view reuses what was already loaded.
 */
export function useDashboardQuery(months: string[], liveMonth: string) {
  const inventory = useQuery({
    queryKey: ["dashboard", "inventory"],
    queryFn: dashboardApi.getInventory,
    refetchInterval: LIVE_REFRESH,
  });
  const parts = useQueries({
    queries: months.map((m) => ({
      queryKey: ["dashboard", "month", m],
      queryFn: () => dashboardApi.getMonth(m),
      // A single month refreshes every minute; in a year only the live month does.
      refetchInterval: months.length === 1 || m === liveMonth ? LIVE_REFRESH : PAST_REFRESH,
    })),
  });

  const all = [...parts, inventory];
  // Changes whenever the months or any query's data change.
  const stamp = `${months.join(",")}|${all.map((q) => q.dataUpdatedAt).join(",")}`;
  const data = useMemo<DashboardData | undefined>(() => {
    if (!inventory.data || parts.some((p) => !p.data)) return undefined;
    return { ...mergeMonthReports(parts.map((p) => p.data!)), inventory: inventory.data };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  const error = all.find((q) => q.error)?.error ?? null;
  return {
    data,
    isPending: all.some((q) => q.isPending),
    isFetching: all.some((q) => q.isFetching),
    isError: error !== null,
    error,
    refetch: () => Promise.all(all.map((q) => q.refetch())),
    dataUpdatedAt: Math.max(0, ...all.map((q) => q.dataUpdatedAt)),
  };
}

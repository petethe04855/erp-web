import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
export function useDashboardQuery(month: string) {
  return useQuery({
    queryKey: ["dashboard", month],
    queryFn: () => dashboardApi.get(month),
    refetchInterval: 60000,
  });
}

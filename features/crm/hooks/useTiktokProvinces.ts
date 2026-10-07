"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "../api/crmApi";
import type { ProvinceQueryParams, TiktokProvinceReport } from "../types/crm";

export function useTiktokProvinces(filters?: ProvinceQueryParams) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<TiktokProvinceReport>({
    queryKey: ["tiktok-provinces-crm", filters],
    queryFn: () => crmApi.getTiktokProvinces(filters),
    staleTime: 60000,
  });

  return {
    report: data,
    summary: data?.summary,
    provinces: data?.provinces || [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

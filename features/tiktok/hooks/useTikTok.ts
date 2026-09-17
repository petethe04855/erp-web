"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tiktokApi } from "../api/tiktokApi";
import type {
  TikTokOrderQueryParams,
  TikTokSyncResult,
  SKUMapping,
} from "../types/tiktok";

export function useTikTokOrders(filters?: TikTokOrderQueryParams) {
  const queryClient = useQueryClient();
  const [syncResult, setSyncResult] = useState<TikTokSyncResult | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tiktok-orders", filters],
    queryFn: () => tiktokApi.getOrders(filters),
    staleTime: 30000,
  });

  const syncMutation = useMutation({
    mutationFn: (days?: number) => tiktokApi.syncOrders(days),
    onSuccess: (result) => {
      setSyncResult(result);
      queryClient.invalidateQueries({ queryKey: ["tiktok-orders"] });
    },
  });

  return {
    orders: data?.orders || [],
    total: data?.total || 0,
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    syncOrders: (days?: number) => syncMutation.mutateAsync(days ?? 30),
    isSyncing: syncMutation.isPending,
    syncResult,
  };
}

export function useTikTokLatestSync() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tiktok-latest-sync"],
    queryFn: () => tiktokApi.getSyncRuns(1),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const latestRun = data && data.length > 0 ? data[0] : null;

  return {
    latestRun,
    isLoading,
    refetch,
  };
}

export function useTikTokConnection() {
  const queryClient = useQueryClient();

  const {
    data: connection,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tiktok-connection"],
    queryFn: () => tiktokApi.getConnection(),
    staleTime: 60000,
  });

  const connectMutation = useMutation({
    mutationFn: () => tiktokApi.startConnect(),
    onSuccess: (data) => {
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    },
  });

  return {
    connection,
    isLoading,
    isError,
    refetch,
    connect: () => connectMutation.mutateAsync(),
    isConnecting: connectMutation.isPending,
  };
}

export function useTikTokMappings() {
  const queryClient = useQueryClient();

  const {
    data: mappings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tiktok-mappings"],
    queryFn: () => tiktokApi.getMappings(),
  });

  const saveMutation = useMutation({
    mutationFn: (mapping: Partial<SKUMapping>) => tiktokApi.saveMapping(mapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiktok-mappings"] });
    },
  });

  return {
    mappings,
    isLoading,
    refetch,
    saveMapping: (mapping: Partial<SKUMapping>) => saveMutation.mutateAsync(mapping),
    isSaving: saveMutation.isPending,
  };
}

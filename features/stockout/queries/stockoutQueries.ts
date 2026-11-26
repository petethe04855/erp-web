import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockoutApi } from "../api/stockoutApi";
import type { StockOutConfig } from "../types/stockout";

export const STOCKOUT_KEYS = {
  all: ["stockout"] as const,
  config: () => [...STOCKOUT_KEYS.all, "config"] as const,
  summary: (date: string) => [...STOCKOUT_KEYS.all, "summary", date] as const,
  batches: (date: string) => [...STOCKOUT_KEYS.all, "batches", date] as const,
  history: (from: string, to: string) => [...STOCKOUT_KEYS.all, "history", from, to] as const,
};

/**
 * Polled every 5 s while the page is open, so every device sees new counts
 * within seconds even when the live stream is down; with the stream up, a
 * slower poll only catches what a missed event would have.
 */
export const pollMs = (streamLive: boolean) => (streamLive ? 15000 : 5000);

export function useStockOutConfigQuery() {
  return useQuery({ queryKey: STOCKOUT_KEYS.config(), queryFn: stockoutApi.getConfig });
}

export function useStockOutSummaryQuery(date: string, intervalMs: number | false) {
  return useQuery({
    queryKey: STOCKOUT_KEYS.summary(date),
    queryFn: () => stockoutApi.summary(date),
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
  });
}

export function useStockOutBatchesQuery(date: string, intervalMs: number | false) {
  return useQuery({
    queryKey: STOCKOUT_KEYS.batches(date),
    queryFn: () => stockoutApi.list(date),
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
  });
}

export function useStockOutHistoryQuery(from: string, to: string) {
  return useQuery({
    queryKey: STOCKOUT_KEYS.history(from, to),
    queryFn: () => stockoutApi.history(from, to),
  });
}

export function useSaveStockOutConfigMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (config: StockOutConfig) => stockoutApi.saveConfig(config),
    onSuccess: (view) => {
      client.setQueryData(STOCKOUT_KEYS.config(), view);
      client.invalidateQueries({ queryKey: STOCKOUT_KEYS.all });
    },
  });
}

export function useVoidBatchMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stockoutApi.void(id),
    onSettled: () => {
      client.invalidateQueries({ queryKey: STOCKOUT_KEYS.all });
      client.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useReviewBatchMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => stockoutApi.review(id, note),
    onSettled: () => client.invalidateQueries({ queryKey: STOCKOUT_KEYS.all }),
  });
}

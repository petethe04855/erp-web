import { useQuery } from "@tanstack/react-query";
import { read } from "@/lib/api";
import type {
  InsightCustomers,
  InsightJourney,
  InsightProducts,
  InsightRange,
  InsightSets,
  InsightSummary,
} from "./types";

export const insightsApi = {
  summary: (r: InsightRange) => read<InsightSummary>("/shopee/insights/summary", r),
  products: (r: InsightRange) => read<InsightProducts>("/shopee/insights/products", r),
  sets: (r: InsightRange) => read<InsightSets>("/shopee/insights/sets", r),
  customers: (r: InsightRange) => read<InsightCustomers>("/shopee/insights/customers", r),
  journey: (r: InsightRange, steps = 4) => read<InsightJourney>("/shopee/insights/journey", { ...r, steps }),
};

const opts = { staleTime: 5 * 60_000 };

// One query per endpoint, so each section loads (and fails) on its own.
export const useInsightSummary = (r: InsightRange) =>
  useQuery({ queryKey: ["shopee-insights", "summary", r.from, r.to], queryFn: () => insightsApi.summary(r), ...opts });
export const useInsightProducts = (r: InsightRange) =>
  useQuery({ queryKey: ["shopee-insights", "products", r.from, r.to], queryFn: () => insightsApi.products(r), ...opts });
export const useInsightSets = (r: InsightRange) =>
  useQuery({ queryKey: ["shopee-insights", "sets", r.from, r.to], queryFn: () => insightsApi.sets(r), ...opts });
export const useInsightCustomers = (r: InsightRange) =>
  useQuery({ queryKey: ["shopee-insights", "customers", r.from, r.to], queryFn: () => insightsApi.customers(r), ...opts });
export const useInsightJourney = (r: InsightRange) =>
  useQuery({ queryKey: ["shopee-insights", "journey", r.from, r.to], queryFn: () => insightsApi.journey(r), ...opts });

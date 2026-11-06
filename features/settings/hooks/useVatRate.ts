import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../api/settingsApi";

export const DEFAULT_VAT_RATE = 7;

// Module-level cache written only inside `setCachedVatRate` (called from
// non-React contexts and tests); React components read through useVatRate.
let cachedVatRate: number | null = null;

export function setCachedVatRate(rate: number | null) {
  cachedVatRate = rate;
}

export function getCachedVatRate(): number {
  return cachedVatRate ?? DEFAULT_VAT_RATE;
}

/** VAT rate (%) configured by the company settings on the backend. */
export function useVatRate() {
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.company.vatRate,
  });

  return {
    vatRate:
      typeof query.data === "number" && query.data >= 0
        ? query.data
        : DEFAULT_VAT_RATE,
    isLoading: query.isPending,
    isError: query.isError,
  };
}

/**
 * Split a VAT-inclusive total into (beforeVat, vat) using an explicit rate.
 * Pure helper: callers pass the rate they got from useVatRate().
 */
export function splitVatInclusive(
  total: number,
  vatRate: number = DEFAULT_VAT_RATE,
): { beforeVat: number; vat: number } {
  if (!(vatRate > 0)) return { beforeVat: total, vat: 0 };
  const beforeVat = total / (1 + vatRate / 100);
  return { beforeVat, vat: total - beforeVat };
}

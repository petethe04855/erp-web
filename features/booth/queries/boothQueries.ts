import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boothApi } from "../api/boothApi";
import type { BoothConfig, CreateBoothSaleDTO } from "../types/booth";

export const BOOTH_QUERY_KEYS = {
  all: ["booth"] as const,
  catalog: () => [...BOOTH_QUERY_KEYS.all, "catalog"] as const,
  sales: (date: string) => [...BOOTH_QUERY_KEYS.all, "sales", date] as const,
};

export function useBoothCatalogQuery() {
  return useQuery({
    queryKey: BOOTH_QUERY_KEYS.catalog(),
    queryFn: boothApi.getCatalog,
    // Stock moves with every other channel too; keep the buttons close to live.
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useBoothSalesQuery(date: string) {
  return useQuery({
    queryKey: BOOTH_QUERY_KEYS.sales(date),
    queryFn: () => boothApi.listSales(date),
  });
}

/** After a bill or a void, the booth stock and the inventory page are both stale. */
function useInvalidateStock() {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: BOOTH_QUERY_KEYS.all });
    client.invalidateQueries({ queryKey: ["inventory"] });
    client.invalidateQueries({ queryKey: ["sku"] });
  };
}

export function useCreateBoothSaleMutation() {
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (dto: CreateBoothSaleDTO) => boothApi.createSale(dto),
    onSettled: invalidate,
  });
}

export function useVoidBoothSaleMutation() {
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => boothApi.voidSale(id, reason),
    onSettled: invalidate,
  });
}

export function useSaveBoothConfigMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (config: BoothConfig) => boothApi.saveConfig(config),
    onSuccess: (catalog) => client.setQueryData(BOOTH_QUERY_KEYS.catalog(), catalog),
  });
}

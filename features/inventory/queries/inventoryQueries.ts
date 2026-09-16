import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventoryApi";
import { InventoryQueryParams, StockAdjustmentDTO } from "../types/inventory";

export const INVENTORY_QUERY_KEYS = {
  all: ["inventory"] as const,
  stocks: (params?: InventoryQueryParams) =>
    [...INVENTORY_QUERY_KEYS.all, "stocks", params] as const,
  formulas: (search?: string, status?: string) =>
    [...INVENTORY_QUERY_KEYS.all, "formulas", { search, status }] as const,
};

export function useInventoryFormulasQuery(search?: string, status?: string) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.formulas(search, status),
    queryFn: () => import("../api/formulaApi").then((m) => m.formulaApi.getFormulas(search, status)),
    staleTime: 30 * 1000,
  });
}

export function useInventoryStocksQuery(params?: InventoryQueryParams) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stocks(params),
    queryFn: () => inventoryApi.getStocks(params),
  });
}

export function useAdjustStockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: StockAdjustmentDTO) => inventoryApi.adjustStock(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

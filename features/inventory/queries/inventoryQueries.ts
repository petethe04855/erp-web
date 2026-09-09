import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventoryApi";
import { InventoryQueryParams, StockAdjustmentDTO } from "../types/inventory";

export const INVENTORY_QUERY_KEYS = {
  all: ["inventory"] as const,
  stocks: (params?: InventoryQueryParams) =>
    [...INVENTORY_QUERY_KEYS.all, "stocks", params] as const,
};

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

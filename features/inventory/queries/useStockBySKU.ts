import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventoryApi";
import type { StockBySKU } from "../types/inventory";

export interface StockInfo {
  available: number;
  reserved: number;
  onHand: number;
  warehouseCount: number;
}

export const INVENTORY_STOCK_KEYS = {
  all: ["inventory-stock-by-sku"] as const,
  list: (params?: { search?: string; limit?: number }) =>
    [...INVENTORY_STOCK_KEYS.all, params] as const,
};

export function useStockBySKU(params?: { search?: string; limit?: number }) {
  const query = useQuery({
    queryKey: INVENTORY_STOCK_KEYS.list(params),
    queryFn: () => inventoryApi.getStockBySKU(params),
    staleTime: 30 * 1000, // 30s fresh
    refetchOnMount: "always",
  });

  const stockMap = new Map<string, StockInfo>();
  if (query.data) {
    for (const item of query.data) {
      const code = item.skuCode?.toUpperCase()?.trim();
      if (code) {
        stockMap.set(code, {
          available: item.availableQty,
          reserved: item.reservedQty,
          onHand: item.quantity,
          warehouseCount: item.warehouseCount,
        });
      }
    }
  }

  return {
    ...query,
    stockMap,
    getStockForSKU: (skuCode: string): StockInfo | undefined => {
      if (!skuCode) return undefined;
      return stockMap.get(skuCode.toUpperCase().trim());
    },
  };
}

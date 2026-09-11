import { list, writeRecord } from "@/lib/api";
import type { ProductRecord } from "@/types/records";
import type {
  InventoryStock,
  InventoryQueryParams,
  StockAdjustmentDTO,
} from "../types/inventory";
export const inventoryApi = {
  getStocks: (params?: InventoryQueryParams) =>
    list<ProductRecord, InventoryStock>(
      "/workspace/products",
      {
        search: params?.search,
        page: params?.page,
        limit: params?.limit,
        type: "Finished Product",
      },
      (p) => {
        // Backend provides the real reorder point (`reorder`).
        // Percent = available stock vs reorder point, clamped to 0-100.
        const reorder = Math.max(0, p.reorder);
        const percent =
          reorder > 0
            ? Math.min(100, Math.max(0, Math.round((p.available / reorder) * 100)))
            : 0;
        return {
          id: p.id,
          sku: p.sku,
          productName: p.name,
          warehouse: "รวมทุกคลัง",
          onHand: p.stock,
          reserved: p.reservedQty,
          available: p.available,
          safetyStock: p.reorder,
          safetyStockPercent: `${percent}%`,
          isBundle: p.isBundle,
        };
      },
    ),
  adjustStock: async (dto: StockAdjustmentDTO) => {
    await writeRecord("/stock-adjustments", {
      note: dto.reason,
      items: [{ sku: dto.sku, actualQty: dto.quantity }],
    });
    return { success: true, data: null };
  },
};

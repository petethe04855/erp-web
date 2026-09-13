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
        isBundle: false,
      },
      (p) => {
        let stockStatus: "out" | "low" | "healthy" = "healthy";
        if (p.available <= 0) {
          stockStatus = "out";
        } else if (p.available <= (p.reorder ?? 10)) {
          stockStatus = "low";
        }

        return {
          id: p.id,
          sku: p.sku,
          productName: p.name,
          image: p.image,
          category: p.type,
          warehouse: "รวมทุกคลัง",
          onHand: p.stock,
          reserved: p.reservedQty,
          available: p.available,
          isActive: p.isActive,
          stockStatus,
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

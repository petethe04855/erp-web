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
  getStockBySKU: async (params?: { search?: string; limit?: number }) => {
    interface RawStockBySKU {
      sku_id: number;
      sku_code: string;
      quantity: number;
      reserved_qty: number;
      available_qty: number;
      warehouse_count: number;
    }
    const res = await list<RawStockBySKU, import("../types/inventory").StockBySKU>(
      "/inventory/stocks",
      {
        view: "by-sku",
        search: params?.search,
        limit: params?.limit ?? 0,
      },
      (r) => ({
        skuId: r.sku_id,
        skuCode: r.sku_code,
        quantity: r.quantity,
        reservedQty: r.reserved_qty,
        availableQty: r.available_qty,
        warehouseCount: r.warehouse_count,
      }),
    );
    return res.data;
  },
};


import { list, read, writeRecord, deleteRecord } from "@/lib/api";
import type { ProductRecord } from "@/features/erp/types/records";
import type { SKU, SKUQueryParams, CreateSKUDTO } from "../types/sku";
export const toSKU = (p: ProductRecord): SKU => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.type,
  price: p.retailPrice,
  cost: p.cost,
  isBundle: p.isBundle,
  stockQuantity: p.isBundle ? undefined : p.stock,
  availableStock: p.isBundle ? undefined : (p.available ?? p.stock),
  reservedStock: p.isBundle ? undefined : p.reservedQty,
  status: p.isActive ? "active" : "inactive",
});
export const skuApi = {
  getSKUs: (params?: SKUQueryParams) =>
    list<ProductRecord, SKU>(
      "/workspace/products",
      {
        ...params,
        type: params?.category,
        isActive:
          params?.status === "active"
            ? true
            : params?.status === "inactive"
              ? false
              : undefined,
        status: undefined,
        category: undefined,
      },
      toSKU,
    ),
  getSKUById: async (sku: string | number) => ({
    success: true,
    data: toSKU(
      await read<ProductRecord>("/products/" + encodeURIComponent(sku)),
    ),
  }),
  createSKU: async (dto: CreateSKUDTO) => {
    const result = await writeRecord<ProductRecord>("/products", {
      sku: dto.sku,
      name: dto.name,
      type: dto.isBundle ? "Bundle" : "Finished Product",
      retailPrice: dto.price,
      wholesalePrice: dto.price,
      cost: dto.cost,
      isBundle: dto.isBundle,
      components: dto.bundleItems?.map((c) => ({
        componentSku: c.componentSku,
        qty: c.quantity,
        unit: "piece",
        componentType: "material",
        yieldFactor: 1,
      })),
    });
    return { ...result, data: toSKU(result.data) };
  },
  updateStatus: async (sku: string | number, status: string) => {
    return writeRecord(
      `/products/${encodeURIComponent(sku)}/status`,
      { status },
      "put",
    );
  },
  deleteSKU: async (sku: string | number) => {
    return deleteRecord(`/products/${encodeURIComponent(sku)}`);
  },
};

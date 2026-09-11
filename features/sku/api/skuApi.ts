import { list, read, writeRecord, deleteRecord } from "@/lib/api";
import type { ProductRecord } from "@/types/records";
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
  image: p.image,
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
  getSKUById: async (sku: string | number) => {
    const p =
      typeof sku === "number"
        ? await read<ProductRecord>(`/products/id/${sku}`)
        : await read<ProductRecord>("/products/" + encodeURIComponent(sku));
    return { success: true, data: toSKU(p) };
  },
  createSKU: async (dto: CreateSKUDTO) => {
    const result = await writeRecord<ProductRecord>("/products", {
      sku: dto.sku,
      name: dto.name,
      type: dto.isBundle ? "Bundle" : "Finished Product",
      retailPrice: dto.price,
      wholesalePrice: dto.price,
      cost: dto.cost,
      isBundle: dto.isBundle,
      image: dto.image,
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
  getBundleComponents: async (sku: string) => {
    return read<Array<{
      id: number;
      bundleSku: string;
      componentSku: string;
      qty: number;
      note?: string;
    }>>(`/bundle-components/${encodeURIComponent(sku)}`);
  },
  updateSKU: async (sku: string | number, dto: import("../types/sku").UpdateSKUDTO) => {
    const result = await writeRecord<ProductRecord>(
      typeof sku === "number"
        ? `/products/id/${sku}`
        : `/products/${encodeURIComponent(sku)}`,
      {
        name: dto.name,
        type: dto.category,
        retailPrice: dto.price,
        wholesalePrice: dto.price,
        cost: dto.cost,
        isBundle: dto.isBundle,
        image: dto.image,
        status: dto.status,
        components: dto.bundleItems?.map((c) => ({
          componentSku: c.componentSku,
          qty: c.quantity,
          unit: "piece",
          componentType: "material",
          yieldFactor: 1,
        })),
      },
      "put",
    );
    return { ...result, data: toSKU(result.data) };
  },
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await (await import("@/lib/axios")).default.post<{
      success: boolean;
      data: { url: string };
      message?: string;
    }>("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res.data?.success || !res.data?.data?.url) {
      throw new Error(res.data?.message || "อัปโหลดรูปภาพไม่สำเร็จ");
    }
    return res.data.data.url;
  },
  updateStatus: async (sku: string | number, status: string) => {
    return writeRecord(
      typeof sku === "number"
        ? `/products/id/${sku}/status`
        : `/products/${encodeURIComponent(sku)}/status`,
      { status },
      "put",
    );
  },
  deleteSKU: async (sku: string | number) => {
    return deleteRecord(
      typeof sku === "number"
        ? `/products/id/${sku}`
        : `/products/${encodeURIComponent(sku)}`,
    );
  },
};

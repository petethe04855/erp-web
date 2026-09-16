import { list, read, writeRecord } from "@/lib/api";
import type { ProductRecord } from "@/types/records";
import type {
  Product,
  ProductQueryParams,
  CreateProductDTO,
} from "../types/product";
const toProduct = (p: ProductRecord): Product => ({
  id: p.id,
  code: p.sku,
  name: p.name,
  category: p.type,
  type: p.type,
  unit: p.baseUnit,
  standardPrice: p.retailPrice,
  standardCost: p.cost,
  status: p.isActive ? "active" : "archived",
});
export const productApi = {
  getProducts: (params?: ProductQueryParams) =>
    list<ProductRecord, Product>(
      "/workspace/products",
      {
        ...params,
        category: undefined,
        isActive:
          params?.status === "active"
            ? true
            : params?.status === "archived"
              ? false
              : undefined,
        status: undefined,
      },
      toProduct,
    ),
  getProductById: async (code: string | number) => ({
    success: true,
    data: toProduct(
      await read<ProductRecord>("/products/" + encodeURIComponent(code)),
    ),
  }),
  createProduct: async (dto: CreateProductDTO) => {
    const res = await writeRecord<ProductRecord>("/products", {
      sku: dto.code,
      name: dto.name,
      type: "Finished Product",
      baseUnit: dto.unit,
      retailPrice: dto.standardPrice,
      wholesalePrice: dto.standardPrice,
      cost: dto.standardCost,
      isBundle: false,
    });
    return { ...res, data: toProduct(res.data) };
  },
};

export interface BundleItem {
  id: number | string;
  skuId: number | string;
  componentSku: string;
  componentName: string;
  quantity: number;
}

export interface SKU {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  isBundle: boolean;
  stockQuantity?: number;
  availableStock?: number;
  reservedStock?: number;
  bundleItems?: BundleItem[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SKUQueryParams {
  search?: string;
  category?: string;
  isBundle?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateSKUDTO {
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  isBundle: boolean;
  bundleItems?: Array<{
    componentSku: string;
    quantity: number;
  }>;
}

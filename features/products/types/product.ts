export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  type: string;
  unit: string;
  standardPrice: number;
  standardCost: number;
  status: string;
  createdAt?: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductDTO {
  code: string;
  name: string;
  category: string;
  type: string;
  unit: string;
  standardPrice: number;
  standardCost: number;
}

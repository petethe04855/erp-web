import { list } from "@/lib/api";
import type {
  ProductRecord,
  CustomerRecord,
  OrderRecord,
} from "../types/records";
export const catalogApi = {
  products: (search: string) =>
    list<ProductRecord, ProductRecord>(
      "/workspace/products",
      { search, limit: 100, isActive: true },
      (row) => row,
    ),
  customers: (search: string) =>
    list<CustomerRecord, CustomerRecord>(
      "/workspace/customers",
      { search, limit: 100 },
      (row) => row,
    ),
  orders: (search: string) =>
    list<OrderRecord, OrderRecord>(
      "/workspace/orders",
      { search, limit: 100 },
      (row) => row,
    ),
};

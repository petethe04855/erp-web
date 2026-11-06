"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { Product } from "../types/product";
import type { ApiPaginationMeta } from "@/types/api";
interface ProductTableProps {
  products: Product[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
}
export function ProductTable(props: ProductTableProps) {
  return (
    <DataTable
      {...props}
      onLimitChange={props.onLimitChange}
      rows={props.products}
      columns={[
        { key: "code", label: "SKU" },
        { key: "name", label: "ชื่อสินค้า" },
        { key: "type", label: "ประเภท" },
        { key: "unit", label: "หน่วย" },
        { key: "standardPrice", label: "ราคาขาย", money: true },
        { key: "standardCost", label: "ต้นทุน", money: true },
      ]}
      actions={(row) => <RecordDetails resource="products" id={row.code} />}
    />
  );
}

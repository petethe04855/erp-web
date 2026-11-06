"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { PurchaseOrder } from "../types/purchase";
import type { ApiPaginationMeta } from "@/types/api";
interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
}
export function PurchaseOrderTable(props: PurchaseOrderTableProps) {
  return (
    <DataTable
      {...props}
      onLimitChange={props.onLimitChange}
      rows={props.purchaseOrders}
      columns={[
        { key: "poNumber", label: "ใบสั่งซื้อ" },
        { key: "supplierName", label: "ผู้จัดจำหน่าย" },
        { key: "orderDate", label: "วันที่" },
        { key: "expectedDeliveryDate", label: "กำหนดรับ" },
        { key: "totalAmount", label: "ยอดรวม", money: true },
        { key: "status", label: "สถานะ" },
      ]}
      actions={(row) => (
        <RecordDetails resource="purchase-orders" id={row.id} />
      )}
    />
  );
}

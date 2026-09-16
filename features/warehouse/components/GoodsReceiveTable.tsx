"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { GoodsReceiveRecord } from "../types/warehouse";
import type { ApiPaginationMeta } from "@/types/api";
interface GoodsReceiveTableProps {
  receives: GoodsReceiveRecord[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}
export function GoodsReceiveTable(props: GoodsReceiveTableProps) {
  return (
    <DataTable
      {...props}
      rows={props.receives}
      columns={[
        { key: "grnNumber", label: "ใบรับสินค้า" },
        { key: "poNumber", label: "ใบสั่งซื้อ" },
        { key: "receivedDate", label: "วันที่รับสินค้า" },
      ]}
      actions={(row) => <RecordDetails resource="goods-receives" id={row.id} />}
    />
  );
}

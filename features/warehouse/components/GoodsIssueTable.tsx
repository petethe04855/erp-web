"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { GoodsIssueRecord } from "../types/warehouse";
import type { ApiPaginationMeta } from "@/types/api";
interface GoodsIssueTableProps {
  issues: GoodsIssueRecord[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}
export function GoodsIssueTable(props: GoodsIssueTableProps) {
  return (
    <DataTable
      {...props}
      rows={props.issues}
      columns={[
        { key: "issueNumber", label: "ใบเบิกสินค้า" },
        { key: "orderNumber", label: "อ้างอิงคำสั่งซื้อ" },
        { key: "reason", label: "เหตุผล" },
        { key: "warehouse", label: "ช่องทาง" },
        { key: "totalItems", label: "จำนวนเบิก" },
        { key: "issuedDate", label: "วันที่" },
      ]}
      actions={(row) => <RecordDetails resource="goods-issues" id={row.id} />}
    />
  );
}

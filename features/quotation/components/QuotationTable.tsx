"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { Quotation } from "../types/quotation";
import type { ApiPaginationMeta } from "@/types/api";
interface QuotationTableProps {
  quotations: Quotation[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
}
export function QuotationTable(props: QuotationTableProps) {
  return (
    <DataTable
      {...props}
      onLimitChange={props.onLimitChange}
      rows={props.quotations}
      columns={[
        { key: "quotationNumber", label: "ใบเสนอราคา" },
        { key: "customerName", label: "ลูกค้า" },
        { key: "leadSource", label: "ช่องทาง (Lead source)" },
        { key: "issueDate", label: "วันที่" },
        { key: "validUntil", label: "ใช้ได้ถึง" },
        { key: "totalAmount", label: "ยอดรวม", money: true },
        { key: "status", label: "สถานะ" },
      ]}
      actions={(row) => <RecordDetails resource="quotations" id={row.id} />}
    />
  );
}

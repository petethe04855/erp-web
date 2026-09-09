"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { Invoice } from "../types/invoice";
import type { ApiPaginationMeta } from "@/types/api";
interface InvoiceTableProps {
  invoices: Invoice[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
}
export function InvoiceTable(props: InvoiceTableProps) {
  return (
    <DataTable
      {...props}
      onLimitChange={props.onLimitChange}
      rows={props.invoices}
      columns={[
        { key: "invoiceNumber", label: "ใบแจ้งหนี้" },
        { key: "orderNumber", label: "ใบสั่งขาย" },
        { key: "customerName", label: "ลูกค้า" },
        { key: "dueDate", label: "ครบกำหนด" },
        { key: "totalAmount", label: "ยอดรวม", money: true },
        { key: "status", label: "สถานะ" },
      ]}
      actions={(row) => <RecordDetails resource="invoices" id={row.id} />}
    />
  );
}

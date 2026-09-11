import Link from "next/link";
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
        {
          key: "invoiceNumber",
          label: "ใบแจ้งหนี้",
          render: (row) => (
            <Link
              href={`/invoices/${row.id}`}
              className="font-medium text-primary hover:underline"
            >
              {row.invoiceNumber}
            </Link>
          ),
        },
        {
          key: "orderNumber",
          label: "ใบสั่งขาย",
          render: (row) => (
            <span className="font-mono text-xs">
              {row.orderNumber || "—"}
            </span>
          ),
        },
        { key: "customerName", label: "ลูกค้า" },
        { key: "dueDate", label: "ครบกำหนด" },
        { key: "totalAmount", label: "ยอดรวม", money: true },
        {
          key: "status",
          label: "สถานะ",
          render: (row) => (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs">{row.status}</span>
              {row.isOverdue && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                  Overdue
                </span>
              )}
            </div>
          ),
        },
      ]}
      actions={(row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/invoices/${row.id}`}>
            <Button size="sm" variant="outline">
              ดูเอกสาร
            </Button>
          </Link>
          <RecordDetails resource="invoices" id={row.id} />
        </div>
      )}
    />
  );
}

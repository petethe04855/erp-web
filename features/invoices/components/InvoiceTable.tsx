import { DataTable } from "@/components/common/DataTable";
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
            <span className="font-medium">
              {row.invoiceNumber}
            </span>
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
          render: (row) => {
            const isPaid = (row.status || "").toUpperCase() === "PAID";
            return (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isPaid ? "Paid" : "Unpaid"}
                </span>
                {row.isOverdue && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                    Overdue
                  </span>
                )}
              </div>
            );
          },
        },
      ]}
      actions={(row) => (
        <div className="flex items-center justify-end gap-2">
          <RecordDetails resource="invoices" id={row.id} />
        </div>
      )}
    />
  );
}

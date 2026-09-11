import Link from "next/link";
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
        {
          key: "quotationNumber",
          label: "ใบเสนอราคา",
          render: (row) => (
            <Link
              href={`/quotation/${row.id}`}
              className="font-medium text-primary hover:underline"
            >
              {row.quotationNumber}
            </Link>
          ),
        },
        { key: "customerName", label: "ลูกค้า" },
        { key: "leadSource", label: "ช่องทาง (Lead source)" },
        { key: "issueDate", label: "วันที่" },
        { key: "validUntil", label: "ใช้ได้ถึง" },
        { key: "totalAmount", label: "ยอดรวม", money: true },
        {
          key: "status",
          label: "สถานะ",
          render: (row) => (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs">{row.status}</span>
              {row.isExpired && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                  Expired
                </span>
              )}
            </div>
          ),
        },
      ]}
      actions={(row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/quotation/${row.id}`}>
            <Button size="sm" variant="outline">
              ดูเอกสาร
            </Button>
          </Link>
          <RecordDetails resource="quotations" id={row.id} />
        </div>
      )}
    />
  );
}

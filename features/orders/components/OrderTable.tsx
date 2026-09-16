import Link from "next/link";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { Order } from "../types/order";
import type { ApiPaginationMeta } from "@/types/api";

interface OrderTableProps {
  orders: Order[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
}

export function OrderTable(props: OrderTableProps) {
  return (
    <DataTable
      {...props}
      rows={props.orders}
      columns={[
        {
          key: "orderNumber",
          label: "ใบสั่งขาย",
          render: (row) => (
            <Link
              href={`/orders/${row.id}`}
              className="font-medium text-primary hover:underline"
            >
              {row.orderNumber}
            </Link>
          ),
        },
        { key: "customerName", label: "ลูกค้า" },
        { key: "channel", label: "ช่องทาง (Channel)" },
        { key: "orderDate", label: "วันที่" },
        { key: "totalAmount", label: "ยอดขาย", money: true },
        { key: "fulfillmentStatus", label: "สถานะ" },
        { key: "paymentStatus", label: "ใบแจ้งหนี้" },
      ]}
      actions={(row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/orders/${row.id}`}>
            <Button size="sm" variant="outline">
              ดูเอกสาร
            </Button>
          </Link>
          <RecordDetails resource="sales-orders" id={row.id} />
        </div>
      )}
    />
  );
}

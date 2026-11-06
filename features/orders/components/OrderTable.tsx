import { DataTable } from "@/components/common/DataTable";
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
            <span className="font-medium">
              {row.orderNumber}
            </span>
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
          <RecordDetails resource="sales-orders" id={row.id} />
        </div>
      )}
    />
  );
}

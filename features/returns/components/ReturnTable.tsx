"use client";

import React from "react";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SalesReturn, ReturnStatus } from "../types/return";
import type { ApiPaginationMeta } from "@/types/api";

interface ReturnTableProps {
  returns: SalesReturn[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
  onSelectReturn: (ret: SalesReturn) => void;
}

export function ReturnTable(props: ReturnTableProps) {
  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">ฉบับร่าง (DRAFT)</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">รออนุมัติ (SUBMITTED)</Badge>;
      case "APPROVED":
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">อนุมัติแล้ว (APPROVED)</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">ตรวจรับแล้ว (COMPLETED)</Badge>;
      case "REJECTED":
        return <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">ปฏิเสธ (REJECTED)</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary" className="bg-neutral-100 text-neutral-400">ยกเลิก (CANCELLED)</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DataTable
      {...props}
      rows={props.returns}
      columns={[
        {
          key: "return_no",
          label: "เลขที่ใบรับคืน",
          render: (row) => (
            <button
              onClick={() => props.onSelectReturn(row)}
              className="font-semibold text-primary hover:underline text-left cursor-pointer"
            >
              {row.return_no}
            </button>
          ),
        },
        {
          key: "return_date",
          label: "วันที่รับคืน",
          render: (row) =>
            row.return_date ? row.return_date.substring(0, 10) : "-",
        },
        {
          key: "return_type",
          label: "ประเภท",
          render: (row) =>
            row.return_type === "CUSTOMER" ? "ลูกค้าคืน" : "คืนภายใน",
        },
        {
          key: "order_no",
          label: "ออเดอร์อ้างอิง",
          render: (row) => row.order_no || "-",
        },
        {
          key: "customer_name",
          label: "ลูกค้า",
          render: (row) => row.customer_name || "-",
        },
        {
          key: "total_qty",
          label: "จำนวน",
          render: (row) => `${row.total_qty} ชิ้น`,
        },
        {
          key: "net_amount",
          label: "ยอดเงินคืน",
          money: true,
        },
        {
          key: "status",
          label: "สถานะ",
          render: (row) => getStatusBadge(row.status),
        },
      ]}
      actions={(row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => props.onSelectReturn(row)}
          >
            รายละเอียด
          </Button>
        </div>
      )}
    />
  );
}

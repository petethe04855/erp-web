"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import type { Customer } from "../types/customer";
import type { ApiPaginationMeta } from "@/types/api";
interface CustomerTableProps {
  customers: Customer[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
}
export function CustomerTable(props: CustomerTableProps) {
  return (
    <DataTable
      {...props}
      rows={props.customers}
      columns={[
        { key: "code", label: "รหัสลูกค้า" },
        { key: "name", label: "ชื่อ" },
        { key: "contactPerson", label: "ผู้ติดต่อ" },
        { key: "email", label: "อีเมล" },
        { key: "phone", label: "โทรศัพท์" },
        { key: "taxId", label: "เลขผู้เสียภาษี" },
      ]}
      actions={(row) => <RecordDetails resource="customers" id={row.id} />}
    />
  );
}

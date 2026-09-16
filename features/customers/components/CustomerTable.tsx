"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import { Building2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
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

function CustomerLogoThumbnail({
  logo,
  name,
}: {
  logo?: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <div className="h-9 w-9 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-400">
        <Building2 className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="h-9 w-9 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 flex items-center justify-center p-0.5">
      <img
        src={getImageUrl(logo)}
        alt={name}
        className="h-full w-full object-contain rounded"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function CustomerTable(props: CustomerTableProps) {
  return (
    <DataTable
      {...props}
      rows={props.customers}
      columns={[
        {
          key: "logo",
          label: "รูปบริษัท",
          render: (row) => (
            <CustomerLogoThumbnail logo={row.logo} name={row.name} />
          ),
        },
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

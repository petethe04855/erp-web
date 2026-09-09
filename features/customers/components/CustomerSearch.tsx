"use client";

import { Input } from "@/components/ui/input";
import { SearchPanel } from "@/components/common/SearchPanel";
import type { CustomerQueryParams } from "../types/customer";

interface CustomerSearchProps {
  filters: CustomerQueryParams;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

export function CustomerSearch(props: CustomerSearchProps) {
  let activeCount = 0;
  if (props.filters.search) activeCount++;
  if (props.filters.status && props.filters.status !== "all") activeCount++;

  return (
    <SearchPanel
      title="ค้นหา / ตัวกรอง"
      onReset={props.onReset}
      activeFilterCount={activeCount}
    >
      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        คำค้นหา
        <Input
          type="search"
          className="mt-1.5 text-xs"
          value={props.filters.search || ""}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="รหัสลูกค้า / ชื่อ / เบอร์โทร / เลขภาษี"
        />
      </label>
    </SearchPanel>
  );
}

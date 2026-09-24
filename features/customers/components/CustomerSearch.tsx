"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import type { CustomerQueryParams } from "../types/customer";

interface CustomerSearchProps {
  filters: CustomerQueryParams;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function CustomerSearch(props: CustomerSearchProps) {
  let activeCount = 0;
  if (props.filters.search) activeCount++;
  if (props.filters.status && props.filters.status !== "all") activeCount++;

  return (
    <FilterToolbar
      onReset={props.onReset}
      activeFilterCount={activeCount}
      actions={props.actions || props.children}
    >
      <div className="relative min-w-[260px] flex-1 sm:max-w-md">
        <Input
          type="search"
          className="h-9 text-xs"
          value={props.filters.search || ""}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="ค้นหารหัสลูกค้า / ชื่อ / เบอร์โทร / เลขภาษี..."
        />
      </div>

      <div className="w-full sm:w-40">
        <Select
          className="h-9 text-xs"
          value={props.filters.status || "all"}
          onChange={(e) => props.onStatusChange(e.target.value)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="active">Active (ใช้งาน)</option>
          <option value="inactive">Inactive (ปิดใช้งาน)</option>
        </Select>
      </div>
    </FilterToolbar>
  );
}

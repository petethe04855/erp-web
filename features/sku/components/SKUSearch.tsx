"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import type { SKUQueryParams } from "../types/sku";

interface SKUSearchProps {
  filters: SKUQueryParams;
  onSearch: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function SKUSearch(props: SKUSearchProps) {
  let activeCount = 0;
  if (props.filters.search) activeCount++;
  if (props.filters.category && props.filters.category !== "all") activeCount++;
  if (props.filters.status && props.filters.status !== "all") activeCount++;

  return (
    <FilterToolbar
      onReset={props.onReset}
      activeFilterCount={activeCount}
      actions={props.actions || props.children}
    >
      {/* Search Input */}
      <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
        <Input
          type="search"
          className="h-9 text-xs"
          value={props.filters.search || ""}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="ค้นหา SKU / ชื่อสินค้า / บาร์โค้ด..."
        />
      </div>

      {/* Status Select */}
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

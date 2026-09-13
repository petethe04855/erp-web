"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchPanel } from "@/components/common/SearchPanel";
import type { SKUQueryParams } from "../types/sku";

interface SKUSearchProps {
  filters: SKUQueryParams;
  onSearch: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

export function SKUSearch(props: SKUSearchProps) {
  let activeCount = 0;
  if (props.filters.search) activeCount++;
  if (props.filters.category && props.filters.category !== "all") activeCount++;
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
          placeholder="รหัส SKU / ชื่อสินค้า / บาร์โค้ด"
        />
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        ประเภทสินค้า
        <Select
          className="mt-1.5 text-xs"
          value={props.filters.category || "all"}
          onChange={(e) => props.onCategoryChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="Finished Product">Finished Product (สินค้าสำเร็จรูป)</option>
          <option value="Raw Material">Raw Material (วัตถุดิบ)</option>
        </Select>
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        สถานะการใช้งาน
        <Select
          className="mt-1.5 text-xs"
          value={props.filters.status || "all"}
          onChange={(e) => props.onStatusChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="active">Active (ใช้งานอยู่)</option>
          <option value="inactive">Inactive (ปิดการใช้งาน)</option>
        </Select>
      </label>
    </SearchPanel>
  );
}

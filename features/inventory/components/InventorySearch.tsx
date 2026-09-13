"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface InventorySearchProps {
  search: string;
  status: string;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

export function InventorySearch({
  search,
  status,
  onSearch,
  onStatusChange,
  onReset,
}: InventorySearchProps) {
  return (
    <aside className="space-y-5 border border-neutral-200 rounded-xl p-5 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          ค้นหา / ตัวกรอง
        </h2>
        <Button size="sm" variant="ghost" onClick={onReset} className="h-7 text-xs">
          ล้าง
        </Button>
      </div>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        คำค้น (รหัส Inventory / ชื่อชุด)
        <Input
          type="search"
          className="mt-1.5 text-xs"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="เช่น SET-A หรือ ชุดทำความสะอาด"
        />
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        สถานะการใช้งาน
        <div className="mt-1.5">
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">เปิดใช้งาน (Active)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </Select>
        </div>
      </label>
    </aside>
  );
}


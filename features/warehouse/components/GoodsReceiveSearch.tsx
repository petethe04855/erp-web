"use client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { GoodsReceiveQueryParams } from "../types/warehouse";
interface GoodsReceiveSearchProps {
  filters: GoodsReceiveQueryParams;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}
export function GoodsReceiveSearch(props: GoodsReceiveSearchProps) {
  return (
    <aside className="space-y-5 border border-neutral-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">ค้นหา / ตัวกรอง</h2>
        <Button size="sm" variant="ghost" onClick={props.onReset}>
          ล้าง
        </Button>
      </div>
      <label className="block text-xs">
        คำค้น
        <Input
          type="search"
          className="mt-2"
          value={props.filters.search || ""}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="รหัส / ชื่อ / เลขเอกสาร"
        />
      </label>
    </aside>
  );
}

"use client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProductQueryParams } from "../types/product";
interface ProductSearchProps {
  filters: ProductQueryParams;
  onSearch: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onReset: () => void;
}
export function ProductSearch(props: ProductSearchProps) {
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
      <label className="block text-xs">
        ประเภท
        <Select
          className="mt-2"
          value={props.filters.type || "all"}
          onChange={(e) => props.onTypeChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="Finished Product">Finished Product</option>
          <option value="Bundle">Bundle</option>
        </Select>
      </label>
    </aside>
  );
}

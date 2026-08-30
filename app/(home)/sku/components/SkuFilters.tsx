"use client";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

interface SkuFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  filterActive: "all" | "active" | "inactive";
  setFilterActive: (value: "all" | "active" | "inactive") => void;
}

export default function SkuFilters({ search, setSearch, filterActive, setFilterActive }: SkuFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัส SKU ชื่อสินค้า หรือ Barcode" className="min-w-[240px] flex-1" />
      <NativeSelect value={filterActive} onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")} className="h-9 w-auto text-xs font-semibold">
        <option value="active">เฉพาะที่ใช้งาน</option>
        <option value="inactive">เฉพาะที่ปิดใช้งาน</option>
        <option value="all">ทั้งหมด</option>
      </NativeSelect>
    </div>
  );
}

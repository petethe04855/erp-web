"use client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { QuotationQueryParams } from "../types/quotation";
interface QuotationSearchProps {
  filters: QuotationQueryParams;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}
export function QuotationSearch(props: QuotationSearchProps) {
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
        สถานะ
        <Select
          className="mt-2"
          value={props.filters.status || "all"}
          onChange={(e) => props.onStatusChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="expired">Expired (หมดอายุ)</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Approved">Approved</option>
          <option value="Converted">Converted</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </label>
    </aside>
  );
}

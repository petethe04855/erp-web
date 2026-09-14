"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchPanel } from "@/components/common/SearchPanel";

interface ReturnSearchProps {
  search: string;
  status: string;
  returnType: string;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReturnTypeChange: (val: string) => void;
  onReset: () => void;
}

export function ReturnSearch(props: ReturnSearchProps) {
  let activeCount = 0;
  if (props.search) activeCount++;
  if (props.status && props.status !== "all") activeCount++;
  if (props.returnType && props.returnType !== "all") activeCount++;

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
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="เลขที่ใบรับคืน / ชื่อลูกค้า / เลขที่ออเดอร์"
        />
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        สถานะเอกสาร
        <Select
          className="mt-1.5 text-xs"
          value={props.status}
          onChange={(e) => props.onStatusChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="DRAFT">ฉบับร่าง (DRAFT)</option>
          <option value="SUBMITTED">ส่งอนุมัติ (SUBMITTED)</option>
          <option value="APPROVED">อนุมัติแล้ว (APPROVED)</option>
          <option value="COMPLETED">ตรวจรับแล้ว (COMPLETED)</option>
          <option value="REJECTED">ปฏิเสธ (REJECTED)</option>
          <option value="CANCELLED">ยกเลิก (CANCELLED)</option>
        </Select>
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        ประเภทการรับคืน
        <Select
          className="mt-1.5 text-xs"
          value={props.returnType}
          onChange={(e) => props.onReturnTypeChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="CUSTOMER">ลูกค้าคืน (CUSTOMER)</option>
          <option value="INTERNAL">คืนภายใน (INTERNAL)</option>
        </Select>
      </label>
    </SearchPanel>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchPanel } from "@/components/common/SearchPanel";
import type { OrderQueryParams } from "../types/order";

interface OrderSearchProps {
  filters: OrderQueryParams;
  onSearch: (val: string) => void;
  onFulfillmentChange: (val: string) => void;
  onPaymentChange: (val: string) => void;
  onChannelChange: (val: string) => void;
  onReset: () => void;
}

export function OrderSearch(props: OrderSearchProps) {
  let activeCount = 0;
  if (props.filters.search) activeCount++;
  if (
    props.filters.fulfillmentStatus &&
    props.filters.fulfillmentStatus !== "all"
  )
    activeCount++;
  if (props.filters.paymentStatus && props.filters.paymentStatus !== "all")
    activeCount++;
  if (props.filters.channel && props.filters.channel !== "all") activeCount++;

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
          placeholder="รหัส / ชื่อลูกค้า / เลขเอกสาร"
        />
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        ช่องทางการขาย (Channel)
        <Select
          className="mt-1.5 text-xs"
          value={props.filters.channel || "all"}
          onChange={(e) => props.onChannelChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="Manual">Manual (หน้าร้าน / ทั่วไป)</option>
          <option value="TikTok">TikTok (TikTok Shop)</option>
          <option value="Shopee">Shopee</option>
          <option value="LINE">LINE</option>
        </Select>
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        สถานะออเดอร์
        <Select
          className="mt-1.5 text-xs"
          value={props.filters.fulfillmentStatus || "all"}
          onChange={(e) => props.onFulfillmentChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="Completed">Completed (สำเร็จ)</option>
          <option value="Cancelled">Cancelled (ยกเลิก)</option>
        </Select>
      </label>

      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        สถานะการชำระเงิน
        <Select
          className="mt-1.5 text-xs"
          value={props.filters.paymentStatus || "all"}
          onChange={(e) => props.onPaymentChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="Unpaid">Unpaid (ยังไม่ชำระ)</option>
          <option value="Paid">Paid (ชำระแล้ว)</option>
        </Select>
      </label>
    </SearchPanel>
  );
}

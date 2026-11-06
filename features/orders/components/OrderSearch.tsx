"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import type { OrderQueryParams } from "../types/order";

interface OrderSearchProps {
  filters: OrderQueryParams;
  onSearch: (val: string) => void;
  onFulfillmentChange: (val: string) => void;
  onPaymentChange: (val: string) => void;
  onChannelChange: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
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
    <FilterToolbar
      onReset={props.onReset}
      activeFilterCount={activeCount}
      actions={props.actions || props.children}
    >
      {/* Search Input */}
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Input
          type="search"
          className="h-9 text-xs"
          value={props.filters.search || ""}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="ค้นหารหัส / ชื่อลูกค้า / เลขเอกสาร..."
        />
      </div>

      {/* Channel */}
      <div className="w-full sm:w-44">
        <Select
          className="h-9 text-xs"
          value={props.filters.channel || "all"}
          onChange={(e) => props.onChannelChange(e.target.value)}
        >
          <option value="all">ช่องทางทั้งหมด</option>
          <option value="Manual">Manual (หน้าร้าน / ทั่วไป)</option>
          <option value="TikTok">TikTok (TikTok Shop)</option>
          <option value="Shopee">Shopee</option>
          <option value="LINE">LINE</option>
        </Select>
      </div>

      {/* Fulfillment Status */}
      <div className="w-full sm:w-40">
        <Select
          className="h-9 text-xs"
          value={props.filters.fulfillmentStatus || "all"}
          onChange={(e) => props.onFulfillmentChange(e.target.value)}
        >
          <option value="all">สถานะออเดอร์ทั้งหมด</option>
          <option value="Completed">Completed (สำเร็จ)</option>
          <option value="Cancelled">Cancelled (ยกเลิก)</option>
        </Select>
      </div>

      {/* Payment Status */}
      <div className="w-full sm:w-36">
        <Select
          className="h-9 text-xs"
          value={props.filters.paymentStatus || "all"}
          onChange={(e) => props.onPaymentChange(e.target.value)}
        >
          <option value="all">การชำระทั้งหมด</option>
          <option value="Unpaid">Unpaid (ยังไม่ชำระ)</option>
          <option value="Paid">Paid (ชำระแล้ว)</option>
        </Select>
      </div>
    </FilterToolbar>
  );
}

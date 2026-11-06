"use client";

import React, { useMemo } from "react";
import { Calendar, RefreshCw, MapPin } from "lucide-react";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { THAI_PROVINCES } from "@/constants/provinces";
import type { ProvinceQueryParams, TiktokProvinceRow } from "../types/crm";

export interface ProvinceSearchProps {
  filters: ProvinceQueryParams;
  onChange: (filters: ProvinceQueryParams) => void;
  provinces: TiktokProvinceRow[];
  availableProvinces?: TiktokProvinceRow[];
  isFetching?: boolean;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export function ProvinceSearch({
  filters,
  onChange,
  provinces,
  availableProvinces,
  isFetching,
  onRefresh,
  actions,
}: ProvinceSearchProps) {
  const handleDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    onChange({
      ...filters,
      dateFrom: start.toISOString().split("T")[0],
      dateTo: end.toISOString().split("T")[0],
    });
  };

  const handleThisMonth = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);

    onChange({
      ...filters,
      dateFrom: start.toISOString().split("T")[0],
      dateTo: end.toISOString().split("T")[0],
    });
  };

  const handleReset = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    onChange({
      dateFrom: start.toISOString().split("T")[0],
      dateTo: end.toISOString().split("T")[0],
      status: "fulfilled",
      province: "",
      channel: "all",
    });
  };

  // Build searchable province options list
  const provinceOptions = useMemo(() => {
    const sourceList =
      availableProvinces && availableProvinces.length > 0
        ? availableProvinces
        : provinces;

    const orderCountMap = new Map<string, number>();
    sourceList.forEach((p) => {
      if (p.province && p.province.trim()) {
        orderCountMap.set(p.province, p.orderCount);
      }
    });

    // 1. Provinces with active orders (sorted descending by order count)
    const active = Array.from(orderCountMap.entries())
      .filter(([name]) => name !== "")
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        label: `${name} (${count.toLocaleString()} ออเดอร์)`,
        value: name,
      }));

    // 2. All other 77 official Thai provinces
    const remaining = THAI_PROVINCES.filter(
      (name) => !orderCountMap.has(name)
    ).map((name) => ({
      label: name,
      value: name,
    }));

    return [...active, ...remaining];
  }, [availableProvinces, provinces]);

  // Count active filters (difference from default: 30 days, fulfilled, all channels, empty province)
  let activeCount = 0;
  if (filters.province) activeCount++;
  if (filters.status && filters.status !== "fulfilled") activeCount++;
  if (filters.channel && filters.channel !== "all") activeCount++;

  return (
    <FilterToolbar
      onReset={handleReset}
      activeFilterCount={activeCount}
      actions={
        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="text-xs text-primary flex items-center gap-1.5 mr-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              กำลังอัปเดต...
            </span>
          )}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isFetching}
              className="h-9 text-xs"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${
                  isFetching ? "animate-spin text-primary" : ""
                }`}
              />
              รีเฟรช
            </Button>
          )}
          {actions}
        </div>
      }
    >
      {/* Quick Date Presets */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs">
        <button
          type="button"
          onClick={() => handleDatePreset(7)}
          className="px-2.5 py-1.5 rounded-md text-[11px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          7 วัน
        </button>
        <button
          type="button"
          onClick={() => handleDatePreset(30)}
          className="px-2.5 py-1.5 rounded-md text-[11px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          30 วัน
        </button>
        <button
          type="button"
          onClick={() => handleDatePreset(90)}
          className="px-2.5 py-1.5 rounded-md text-[11px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          90 วัน
        </button>
        <button
          type="button"
          onClick={handleThisMonth}
          className="px-2.5 py-1.5 rounded-md text-[11px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          เดือนนี้
        </button>
      </div>

      {/* Date Range Inputs */}
      <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800/80">
        <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">
          ช่วงวันที่:
        </span>
        <Input
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="h-7 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
        />
        <span className="text-neutral-400">-</span>
        <Input
          type="date"
          value={filters.dateTo || ""}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className="h-7 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
        />
      </div>

      {/* Channel Selector */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs">
        {[
          { value: "all", label: "รวมทั้งหมด" },
          { value: "tiktok", label: "TikTok" },
          { value: "shopee", label: "Shopee" },
        ].map((ch) => {
          const active = (filters.channel || "all") === ch.value;
          return (
            <button
              key={ch.value}
              type="button"
              onClick={() => onChange({ ...filters, channel: ch.value })}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                active
                  ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {ch.label}
            </button>
          );
        })}
      </div>

      {/* Status Selector */}
      <div className="w-full sm:w-44">
        <Select
          value={filters.status || "fulfilled"}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="h-9 text-xs"
        >
          <option value="fulfilled">จัดส่งแล้ว / สำเร็จ</option>
          <option value="all">สถานะทั้งหมด</option>
          <option value="cancelled">ยกเลิก / คืนสินค้า</option>
        </Select>
      </div>

      {/* Province Selector Combobox */}
      <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800/80">
        <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">
          จังหวัด:
        </span>
        <Combobox
          value={filters.province || ""}
          onChange={(value) => onChange({ ...filters, province: value })}
          options={provinceOptions}
          variant="inline"
          placeholder="ทุกจังหวัด"
          searchPlaceholder="ค้นหาชื่อจังหวัด..."
          emptyText="ไม่พบจังหวัดที่ค้นหา"
          popoverClassName="w-64 max-h-72"
        />
      </div>
    </FilterToolbar>
  );
}

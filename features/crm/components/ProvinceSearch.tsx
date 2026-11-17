"use client";

import React from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProvinceQueryParams } from "../types/crm";
import { DATE_PRESETS, datePresetRange, type DatePresetKey } from "../utils/dateRange";

export interface ProvinceSearchProps {
  filters: ProvinceQueryParams;
  onChange: (filters: ProvinceQueryParams) => void;
  isFetching?: boolean;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export function ProvinceSearch({
  filters,
  onChange,
  isFetching,
  onRefresh,
  actions,
}: ProvinceSearchProps) {
  const applyPreset = (key: DatePresetKey) => {
    onChange({ ...filters, ...datePresetRange(key) });
  };

  const handleReset = () => {
    onChange({
      ...datePresetRange("30d"),
      status: "fulfilled",
      province: "",
      channel: "all",
    });
  };

  const activePreset = DATE_PRESETS.find((p) => {
    const r = datePresetRange(p.key);
    return r.dateFrom === filters.dateFrom && r.dateTo === filters.dateTo;
  })?.key;

  // Count active filters (difference from default: fulfilled, all channels)
  let activeCount = 0;
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
        {DATE_PRESETS.map((p) => {
          const active = activePreset === p.key;
          return (
            <button
              key={p.key}
              type="button"
              aria-pressed={active}
              onClick={() => applyPreset(p.key)}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                active
                  ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {p.label}
            </button>
          );
        })}
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

    </FilterToolbar>
  );
}

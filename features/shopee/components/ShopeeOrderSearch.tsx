"use client";

import React from "react";
import { Search, Calendar, RefreshCw, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterToolbar } from "@/components/common/FilterToolbar";

interface ShopeeOrderSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onReset: () => void;
  onRefresh: () => void;
  onOpenUpload: () => void;
  loading: boolean;
  totalItems?: number;
}

export function ShopeeOrderSearch({
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  limit = 50,
  onLimitChange,
  onReset,
  onRefresh,
  onOpenUpload,
  loading,
  totalItems,
}: ShopeeOrderSearchProps) {
  let activeCount = 0;
  if (search) activeCount++;
  if (startDate) activeCount++;
  if (endDate) activeCount++;

  return (
    <FilterToolbar
      onReset={onReset}
      activeFilterCount={activeCount}
      actions={
        <div className="flex items-center gap-2">
          {typeof totalItems === "number" && (
            <span className="font-mono text-xs text-neutral-500 mr-2 hidden sm:inline-block">
              {totalItems.toLocaleString()} รายการ
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-9 text-xs"
            title="รีเฟรชข้อมูลคำสั่งซื้อ"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin text-orange-500" : ""}`}
            />
            รีเฟรช
          </Button>
          <Button
            size="sm"
            onClick={onOpenUpload}
            className="h-9 bg-orange-600 hover:bg-orange-700 text-white text-xs whitespace-nowrap"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            นำเข้าไฟล์ Order
          </Button>
        </div>
      }
    >
      {/* Search Bar */}
      <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหา Order ID, SKU, ชื่อสินค้า, ผู้ซื้อ..."
          className="h-9 pl-8 text-xs font-normal"
        />
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800/80">
        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">
          วันที่สั่งซื้อ:
        </span>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="h-7 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
        />
        <span className="text-neutral-400">-</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="h-7 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
        />
      </div>

      {/* Items Per Page (Limit) Selector */}
      {onLimitChange && (
        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800/80">
          <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">
            แสดง:
          </span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-7 border-none bg-transparent p-0 text-xs font-semibold focus:outline-none dark:bg-neutral-800"
          >
            <option value={10}>10 รายการ</option>
            <option value={20}>20 รายการ</option>
            <option value={50}>50 รายการ</option>
            <option value={100}>100 รายการ</option>
          </select>
        </div>
      )}
    </FilterToolbar>
  );
}

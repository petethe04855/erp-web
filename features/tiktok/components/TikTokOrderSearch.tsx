import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import type {
  TikTokOrderQueryParams,
  TikTokSyncResult,
} from "../types/tiktok";

interface TikTokOrderSearchProps {
  filters: TikTokOrderQueryParams;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onStockStatusChange?: (status: string) => void;
  onLimitChange?: (limit: number) => void;
  onReset: () => void;
  onSync: (days: number) => Promise<unknown>;
  isSyncing: boolean;
  syncResult: TikTokSyncResult | null;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function TikTokOrderSearch({
  filters,
  onSearchChange,
  onStatusChange,
  onStockStatusChange,
  onLimitChange,
  onReset,
  onSync,
  isSyncing,
  syncResult,
  actions,
  children,
}: TikTokOrderSearchProps) {
  const [syncDays, setSyncDays] = useState(30);

  let activeCount = 0;
  if (filters.search) activeCount++;
  if (filters.status && filters.status !== "ALL") activeCount++;
  if (filters.stockStatus && filters.stockStatus !== "all") activeCount++;

  return (
    <div className="space-y-3">
      {/* Horizontal Filter Toolbar */}
      <FilterToolbar
        onReset={onReset}
        activeFilterCount={activeCount}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Sync Controls */}
            <div className="flex items-center gap-1.5">
              <Select
                value={String(syncDays)}
                onChange={(e) => setSyncDays(Number(e.target.value))}
                className="h-9 w-28 text-xs"
              >
                <option value="7">7 วันย้อนหลัง</option>
                <option value="15">15 วันย้อนหลัง</option>
                <option value="30">30 วันย้อนหลัง</option>
                <option value="60">60 วันย้อนหลัง</option>
              </Select>
              <Button
                onClick={() => onSync(syncDays)}
                disabled={isSyncing}
                size="sm"
                className="h-9 bg-neutral-900 hover:bg-neutral-800 text-white text-xs whitespace-nowrap"
              >
                <RefreshCw
                  className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "กำลังซิงค์..." : "ซิงค์ออเดอร์"}
              </Button>
            </div>
            {actions || children}
          </div>
        }
      >
        {/* Search */}
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Input
            type="search"
            value={filters.search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="เลขออเดอร์, ชื่อลูกค้า, SKU..."
            className="h-9 text-xs"
          />
        </div>

        {/* Status */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.status || "ALL"}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="AWAITING_SHIPMENT">รอจัดส่ง</option>
            <option value="AWAITING_COLLECTION">รอขนส่งรับ</option>
            <option value="IN_TRANSIT">กำลังจัดส่ง</option>
            <option value="DELIVERED">จัดส่งแล้ว</option>
            <option value="COMPLETED">สำเร็จ</option>
            <option value="CANCELLED">ยกเลิก</option>
          </Select>
        </div>

        {/* Stock Status */}
        {onStockStatusChange && (
          <div className="w-full sm:w-44">
            <Select
              value={filters.stockStatus || "all"}
              onChange={(e) => onStockStatusChange(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="all">สต็อก ERP ทั้งหมด</option>
              <option value="DEDUCTED">ตัดสต็อกแล้ว</option>
              <option value="PENDING">รอตัดสต็อก</option>
              <option value="FAILED">ตัดไม่สำเร็จ</option>
            </Select>
          </div>
        )}

        {/* Page Limit */}
        {onLimitChange && (
          <div className="w-full sm:w-32">
            <Select
              value={String(filters.limit || 50)}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-9 text-xs"
            >
              <option value="20">20 / หน้า</option>
              <option value="50">50 / หน้า</option>
              <option value="100">100 / หน้า</option>
            </Select>
          </div>
        )}
      </FilterToolbar>

      {/* Sync Result Banner if exists */}
      {syncResult && (
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm text-xs flex flex-wrap items-center justify-between gap-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>ซิงค์สำเร็จ {syncResult.synced} รายการ</span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-600 dark:text-neutral-300">ตัดสต็อก ERP: {syncResult.stockDeducted} รายการ</span>
          </div>
          {syncResult.stockDeductionErrors && syncResult.stockDeductionErrors.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>ตัดสต็อกไม่สำเร็จ {syncResult.stockDeductionErrors.length} รายการ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

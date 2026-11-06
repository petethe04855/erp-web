"use client";

import React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterToolbar } from "@/components/common/FilterToolbar";

interface ShopeeMatchingSearchProps {
  month: string;
  onMonthChange: (month: string) => void;
  onResetToCurrent: () => void;
  onRefetch: () => void;
  onExportCSV: () => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  loading: boolean;
  totalItems: number;
}

function formatThaiMonth(ym: string): string {
  if (!ym) return "";
  const parts = ym.split("-");
  if (parts.length < 2) return ym;
  const monthNum = parseInt(parts[1], 10);
  const yearNum = parseInt(parts[0], 10) + 543;
  const thaiMonths = [
    "",
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${thaiMonths[monthNum] || parts[1]} ${yearNum}`;
}

export function ShopeeMatchingSearch({
  month,
  onMonthChange,
  onResetToCurrent,
  onRefetch,
  onExportCSV,
  limit = 10,
  onLimitChange,
  loading,
  totalItems,
}: ShopeeMatchingSearchProps) {
  const getCurrentYM = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const currentYM = getCurrentYM();
  const isCurrentMonth = month === currentYM;

  const shiftMonth = (offset: number) => {
    const [yStr, mStr] = (month || currentYM).split("-");
    const d = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1 + offset, 1);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, "0");
    onMonthChange(`${newY}-${newM}`);
  };

  return (
    <FilterToolbar
      actions={
        <div className="flex items-center gap-2">
          {/* <span className="font-mono text-xs text-neutral-500 mr-2 hidden sm:inline-block">
            {totalItems.toLocaleString()} รายการ
          </span> */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefetch}
            disabled={loading}
            className="h-9 text-xs"
            title="คำนวณการจับคู่ใหม่"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin text-orange-500" : ""}`}
            />
            คำนวณใหม่
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            disabled={loading || totalItems === 0}
            className="h-9 text-xs border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 whitespace-nowrap"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            ส่งออก CSV
          </Button>
        </div>
      }
    >
      {/* Month Stepper Controller */}
      <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          onClick={() => shiftMonth(-1)}
          title="เดือนก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="h-7 w-32 border-none p-0 text-xs font-semibold text-center focus-visible:ring-0"
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          onClick={() => shiftMonth(1)}
          title="เดือนถัดไป"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month Context Badge & Reset */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1.5 rounded-md font-medium text-neutral-700 dark:text-neutral-300">
          {isCurrentMonth
            ? `📅 เดือนปัจจุบัน: ${formatThaiMonth(month)}`
            : `🕰️ ดูย้อนหลัง: ${formatThaiMonth(month)}`}
        </span>

        {!isCurrentMonth && (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-2.5 text-[11px] font-medium"
            onClick={onResetToCurrent}
          >
            กลับสู่เดือนปัจจุบัน
          </Button>
        )}
      </div>

      {/* Items Per Page (Limit) Selector */}
      {/* {onLimitChange && (
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
      )} */}
    </FilterToolbar>
  );
}

"use client";

import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Platform } from "../types/dashboard";
import type { PeriodMode } from "../hooks/useDashboard";
import { PlatformFilter } from "./PlatformFilter";
import { SegmentedControl } from "./SectionCard";

const money = (v: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(v);

const MODE_OPTIONS = [
  { id: "month", label: "รายเดือน" },
  { id: "year", label: "รายปี" },
] as const;

interface DashboardFilterBarProps {
  mode: PeriodMode;
  onModeChange: (mode: PeriodMode) => void;
  month: string;
  onMonthChange: (ym: string) => void;
  year: number;
  currentYear: number;
  onYearChange: (year: number) => void;
  /** Steps the month or the year, depending on the mode. */
  onShift: (offset: number) => void;
  isCurrentPeriod: boolean;
  onCurrentPeriod: () => void;
  platforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
  stats: { orders: number; revenue: number; customers: number; loading: boolean };
  /** Shown only when a filter differs from the default. */
  onReset?: () => void;
}

/** Period (month or year) and platform filters, with a live count of what they select. */
export function DashboardFilterBar({
  mode,
  onModeChange,
  month,
  onMonthChange,
  year,
  currentYear,
  onYearChange,
  onShift,
  isCurrentPeriod,
  onCurrentPeriod,
  platforms,
  onPlatformsChange,
  stats,
  onReset,
}: DashboardFilterBarProps) {
  const yearly = mode === "year";
  const unit = yearly ? "ปี" : "เดือน";
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  if (!years.includes(year)) years.push(year);

  const stat = (label: string, value: string, unitText?: string) => (
    <span className="whitespace-nowrap">
      {label}{" "}
      <strong className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
        {stats.loading ? "…" : value}
      </strong>
      {unitText && ` ${unitText}`}
    </span>
  );

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl label="ช่วงเวลา" value={mode} options={MODE_OPTIONS} onChange={onModeChange} />

        <div className="flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-800/50">
          <CalendarDays className="ml-1.5 h-3.5 w-3.5 text-neutral-400" aria-hidden />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
            onClick={() => onShift(-1)}
            title={`${unit}ก่อนหน้า`}
            aria-label={`${unit}ก่อนหน้า`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {yearly ? (
            <select
              aria-label="เลือกปี"
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              className="h-7 w-24 cursor-pointer rounded-md bg-transparent text-center text-xs font-semibold focus-visible:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y + 543} ({y})
                </option>
              ))}
            </select>
          ) : (
            <Input
              aria-label="เลือกเดือน"
              type="month"
              value={month}
              onChange={(e) => {
                if (e.target.value) onMonthChange(e.target.value);
              }}
              className="h-7 w-32 border-none bg-transparent p-0 text-center text-xs font-semibold shadow-none focus-visible:ring-0"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
            onClick={() => onShift(1)}
            disabled={yearly && year >= currentYear}
            title={`${unit}ถัดไป`}
            aria-label={`${unit}ถัดไป`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isCurrentPeriod && (
            <Button variant="secondary" size="sm" className="h-7 px-2 text-[11px] font-medium" onClick={onCurrentPeriod}>
              {unit}ปัจจุบัน
            </Button>
          )}
        </div>
        <PlatformFilter value={platforms} onChange={onPlatformsChange} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-neutral-500" aria-live="polite">
        {stat("คำสั่งซื้อ", stats.orders.toLocaleString("th-TH"), "บิล")}
        {stat("ยอดขาย", money(stats.revenue))}
        {stat("ลูกค้า", stats.customers.toLocaleString("th-TH"), "ราย")}
        {onReset && (
          <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 text-[11px]" onClick={onReset}>
            <RotateCcw className="h-3 w-3" />
            รีเซ็ต
          </Button>
        )}
      </div>
    </div>
  );
}

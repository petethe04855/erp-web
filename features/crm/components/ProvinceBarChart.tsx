"use client";

import React from "react";
import { TrendingUp, Award } from "lucide-react";
import type { TiktokProvinceRow } from "../types/crm";

interface ProvinceBarChartProps {
  provinces: TiktokProvinceRow[];
  isLoading?: boolean;
  onSelectProvince?: (province: string) => void;
  selectedProvince?: string;
}

export function ProvinceBarChart({
  provinces,
  isLoading,
  onSelectProvince,
  selectedProvince,
}: ProvinceBarChartProps) {
  const top10 = provinces.slice(0, 10);
  const maxOrderCount = top10.length > 0 ? Math.max(...top10.map((p) => p.orderCount)) : 1;

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-neutral-200/80 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded mb-6" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
                <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
              </div>
              <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (top10.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-neutral-200/80 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm text-center">
        <TrendingUp className="w-10 h-10 text-neutral-400 mx-auto mb-2 opacity-50" />
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          ไม่พบข้อมูลออเดอร์ในช่วงเวลาที่เลือก
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          ลองปรับเปลี่ยนช่วงเวลาหรือตัวกรองสถานะคำสั่งซื้อ
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-neutral-200/80 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            10 อันดับจังหวัดที่มีออเดอร์สูงสุด
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            คลิกที่แถบจังหวัดเพื่อกรองดูข้อมูลเฉพาะจังหวัดนั้น
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
          Top 10
        </span>
      </div>

      <div className="space-y-3.5">
        {top10.map((row, index) => {
          const orderCount = row.orderCount;
          const sharePercent = row.sharePercent;
          const grossSales = row.grossSales;
          const pct = Math.max(4, Math.round((orderCount / maxOrderCount) * 100));
          const isSelected = selectedProvince === row.province;

          let rankBadge = "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
          if (index === 0) rankBadge = "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold";
          else if (index === 1) rankBadge = "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold";
          else if (index === 2) rankBadge = "bg-amber-700/10 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 font-semibold";

          return (
            <div
              key={row.province}
              onClick={() => onSelectProvince?.(isSelected ? "" : row.province)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 dark:border-primary/80"
                  : "border-transparent hover:border-neutral-200 hover:bg-neutral-50/80 dark:hover:border-neutral-800 dark:hover:bg-neutral-800/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 flex items-center justify-center rounded text-[11px] ${rankBadge}`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {row.province}
                  </span>
                  {row.province === "ไม่ทราบจังหวัด" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400">
                      Unmapped
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    ฿{grossSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {orderCount.toLocaleString()} ออเดอร์
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {sharePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    index === 0
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : index === 1
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : index === 2
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-neutral-400 dark:bg-neutral-600"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

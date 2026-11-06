"use client";

import React from "react";
import { ShoppingBag, Package, Coins, MapPin, CheckCircle2 } from "lucide-react";
import type { TiktokProvinceSummary } from "../types/crm";

interface ProvinceSummaryCardsProps {
  summary?: TiktokProvinceSummary;
  isLoading?: boolean;
}

export function ProvinceSummaryCards({ summary, isLoading }: ProvinceSummaryCardsProps) {
  const cards = [
    {
      title: "ออเดอร์ทั้งหมด",
      value: summary ? summary.totalOrders.toLocaleString() : "0",
      subtext: "รายการ",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400",
    },
    {
      title: "จำนวนสินค้า",
      value: summary ? summary.totalItemQty.toLocaleString() : "0",
      subtext: "ชิ้น",
      icon: Package,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400",
    },
    {
      title: "ยอดขายรวม",
      value: summary ? `฿${summary.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "฿0.00",
      subtext: "ก่อนหักค่าธรรมเนียม",
      icon: Coins,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400",
    },
    {
      title: "จังหวัดที่ซื้อเยอะสุด",
      value: summary?.topProvince || "-",
      subtext: summary?.provinceCount ? `จาก ${summary.provinceCount} จังหวัด` : "",
      icon: MapPin,
      color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400",
    },
    {
      title: "ความครบถ้วนข้อมูล",
      value: summary ? `${summary.dataCompletenessPercent.toFixed(1)}%` : "0%",
      subtext: summary?.dataCompletenessPercent && summary.dataCompletenessPercent >= 95 ? "ข้อมูลสมบูรณ์" : "มีข้อมูลไม่ระบุจังหวัด",
      icon: CheckCircle2,
      color: summary && summary.dataCompletenessPercent >= 90
        ? "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-400"
        : "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl border border-neutral-200/80 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-7 w-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded my-1" />
            ) : (
              <div className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                {c.value}
              </div>
            )}
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 truncate">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}

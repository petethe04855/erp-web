"use client";

import React from "react";
import { Building2, Home, Waves, MapPin } from "lucide-react";
import type { TiktokProvinceRow, TiktokProvinceSummary } from "../types/crm";
import { UNKNOWN_PROVINCE } from "../constants/regions";

interface ProvinceSummaryCardsProps {
  summary?: TiktokProvinceSummary;
  provinces: TiktokProvinceRow[];
  isLoading?: boolean;
}

/** Geographic KPI cards: top 3 provinces + national coverage. */
export function ProvinceSummaryCards({ summary, provinces, isLoading }: ProvinceSummaryCardsProps) {
  const ranked = provinces.filter((p) => p.province !== UNKNOWN_PROVINCE);
  const top = (i: number) => ranked[i];

  const rankSub = (row?: TiktokProvinceRow) =>
    row ? (
      <>
        <strong className="font-semibold text-neutral-700 dark:text-neutral-200">
          {row.orderCount.toLocaleString()} ออเดอร์ ({row.sharePercent.toFixed(1)}%)
        </strong>{" "}
        | ฿{row.grossSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </>
    ) : (
      "-"
    );

  const totalProvinces = summary?.totalProvinces || 77;
  const cards = [
    {
      title: "จังหวัดลูกค้าสูงสุด (#1)",
      value: top(0)?.province ?? "-",
      sub: rankSub(top(0)),
      icon: Building2,
      accent: "text-cyan-600 dark:text-cyan-400",
      iconBox: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-400",
    },
    {
      title: "อันดับ 2",
      value: top(1)?.province ?? "-",
      sub: rankSub(top(1)),
      icon: Home,
      accent: "text-blue-600 dark:text-blue-400",
      iconBox: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400",
    },
    {
      title: "อันดับ 3",
      value: top(2)?.province ?? "-",
      sub: rankSub(top(2)),
      icon: Waves,
      accent: "text-emerald-600 dark:text-emerald-400",
      iconBox: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400",
    },
    {
      title: "ความครอบคลุมทั่วประเทศ",
      value: `${summary?.provinceCount ?? 0} จังหวัด`,
      sub: `จาก ${totalProvinces} จังหวัดทั่วไทย (ครอบคลุม ${(summary?.coveragePercent ?? 0).toFixed(1)}%)`,
      icon: MapPin,
      accent: "text-violet-600 dark:text-violet-400",
      iconBox: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.title}</span>
              <div className={`rounded-lg border p-1.5 ${c.iconBox}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="my-1 h-7 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            ) : (
              <div className={`truncate text-xl font-bold tracking-tight ${c.accent}`}>{c.value}</div>
            )}
            <div className="mt-1 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
              {isLoading ? "" : c.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}

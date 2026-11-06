"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import type { MonthlySummary } from "../types/shopee.types";

interface Props {
  trends: MonthlySummary[];
  loading: boolean;
}

export function ShopeeMonthlyTrendChart({ trends, loading }: Props) {
  if (loading) {
    return (
      <div className="h-80 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100/60 p-6 dark:border-neutral-800 dark:bg-neutral-800/40" />
    );
  }

  if (trends.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
        <BarChart3 className="mb-2 h-8 w-8 text-neutral-300 dark:text-neutral-600" />
        <p className="text-sm">ไม่มีข้อมูลแนวโน้มรายเดือนในช่วงเวลาที่เลือก</p>
      </div>
    );
  }

  // Find max value to scale the visual bars
  const maxGross = Math.max(...trends.map((t) => Math.max(t.gross_sale, t.net_receive, 1)));

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3.5">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            แนวโน้มรายได้และกำไรรายเดือน (Monthly Revenue, Costs & Net Profit)
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            จัดกลุ่มตามเดือนที่เงินโอนสำเร็จจริง (Income Transfer Month)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
            <span className="text-neutral-600 dark:text-neutral-400">ยอดขายรวม (Gross)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span className="text-neutral-600 dark:text-neutral-400">ยอดโอนสุทธิ (Net)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
            <span className="text-neutral-600 dark:text-neutral-400">กำไรสุทธิ (Profit)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {trends.map((t) => {
          const grossWidth = Math.max((t.gross_sale / maxGross) * 100, 2);
          const netWidth = Math.max((t.net_receive / maxGross) * 100, 2);
          const profitWidth = Math.max((Math.max(t.net_profit, 0) / maxGross) * 100, 2);

          return (
            <div
              key={t.month}
              className="group rounded-lg border border-neutral-100 dark:border-neutral-800/60 p-3 transition hover:border-neutral-200 hover:bg-neutral-50/70 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <Link
                  href={`/shopee/matching?month=${t.month}`}
                  className="flex items-center gap-1 font-mono font-bold text-neutral-800 hover:text-orange-600 dark:text-neutral-200"
                >
                  <span>{t.month}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-neutral-500">{t.order_count.toLocaleString()} ออเดอร์</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Net: ฿{t.net_receive.toLocaleString("th-TH", { minimumFractionDigits: 0 })}
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    กำไร: ฿{t.net_profit.toLocaleString("th-TH", { minimumFractionDigits: 0 })} (
                    {t.profit_margin_pct.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Multi-bars */}
              <div className="mt-2 space-y-1">
                {/* Gross bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${grossWidth}%` }}
                    title={`Gross: ฿${t.gross_sale.toFixed(2)}`}
                  />
                </div>
                {/* Net Receive bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${netWidth}%` }}
                    title={`Net: ฿${t.net_receive.toFixed(2)}`}
                  />
                </div>
                {/* Profit bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      t.net_profit >= 0 ? "bg-orange-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${profitWidth}%` }}
                    title={`Profit: ฿${t.net_profit.toFixed(2)}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Award, Package } from "lucide-react";
import type { TopSKUStat } from "../types/shopee.types";

interface Props {
  topSkus: TopSKUStat[];
  loading: boolean;
}

export function ShopeeTopSKUTable({ topSkus, loading }: Props) {
  if (loading) {
    return (
      <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100/60 p-6 dark:border-neutral-800 dark:bg-neutral-800/40" />
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            <Award className="h-4 w-4 text-amber-500" />
            <span>Top 5 สินค้าทำกำไรสูงสุด (Top Profitable SKUs)</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            จัดอันดับตามกำไรสุทธิรวม (Net Profit) ในช่วงเวลาที่เลือก
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
            <tr>
              <th className="px-3 py-2.5 text-center w-12">อันดับ</th>
              <th className="px-3 py-2.5 min-w-[180px]">SKU & ชื่อสินค้า</th>
              <th className="px-3 py-2.5 text-center w-24">จำนวนขาย</th>
              <th className="px-3 py-2.5 text-right w-32">ยอดขายรวม (Gross)</th>
              <th className="px-3 py-2.5 text-right w-32">ต้นทุนรวม (Cost)</th>
              <th className="px-3 py-2.5 text-right w-32">กำไรสุทธิ (Profit)</th>
              <th className="px-3 py-2.5 text-right w-24">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {topSkus.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500">
                  <Package className="mx-auto mb-1 h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                  <span>ยังไม่มีข้อมูลการขายสินค้าในช่วงที่เลือก</span>
                </td>
              </tr>
            )}

            {topSkus.map((sku, idx) => (
              <tr key={sku.sku} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                <td className="px-3 py-2.5 text-center font-bold text-neutral-500">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                      idx === 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : idx === 1
                        ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200"
                        : idx === 2
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300"
                        : "text-neutral-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="font-mono font-bold text-orange-600 dark:text-orange-400">
                    {sku.sku}
                  </div>
                  <div className="max-w-[320px] truncate text-neutral-500 text-[11px]" title={sku.product_name}>
                    {sku.product_name}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                  {sku.total_qty.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-neutral-700 dark:text-neutral-300">
                  ฿{sku.total_gross.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-neutral-500">
                  ฿{sku.total_cost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ฿{sku.net_profit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                  {sku.margin_pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

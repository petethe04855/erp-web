"use client";

import React from "react";
import { TrendingUp, ShoppingBag, CreditCard, Tag, ArrowDownRight, DollarSign } from "lucide-react";
import type { MonthlySummary } from "../types/shopee.types";

interface Props {
  summary: MonthlySummary | null;
  loading: boolean;
}

export function ShopeeMatchingSummaryCard({ summary, loading }: Props) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100/60 p-4 dark:border-neutral-800 dark:bg-neutral-800/40"
          />
        ))}
      </div>
    );
  }

  const formatTHB = (val: number) =>
    val.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* Gross Sale */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>ยอดขายรวม (Gross)</span>
          <ShoppingBag className="h-4 w-4 text-blue-500" />
        </div>
        <div className="mt-2 font-mono text-lg xl:text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
          ฿{formatTHB(summary.gross_sale)}
        </div>
        <div className="mt-1 text-[11px] text-neutral-400">
          {summary.order_count.toLocaleString()} ออเดอร์ ({summary.item_count.toLocaleString()} ชิ้น)
        </div>
      </div>

      {/* Platform Fees */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>ค่าธรรมเนียม Shopee</span>
          <ArrowDownRight className="h-4 w-4 text-rose-500" />
        </div>
        <div className="mt-2 font-mono text-lg xl:text-xl font-bold text-rose-600 dark:text-rose-400 truncate">
          -฿{formatTHB(summary.platform_fees)}
        </div>
        <div className="mt-1 text-[11px] text-neutral-400">
          {summary.gross_sale > 0
            ? ((summary.platform_fees / summary.gross_sale) * 100).toFixed(1)
            : 0}
          % ของยอดขาย
        </div>
      </div>

      {/* Net Receive */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>ยอดโอนรับจริง (Net)</span>
          <CreditCard className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="mt-2 font-mono text-lg xl:text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
          ฿{formatTHB(summary.net_receive)}
        </div>
        <div className="mt-1 text-[11px] text-neutral-400">ยอดเงินโอนเข้าบัญชี</div>
      </div>

      {/* Total Cost */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>ต้นทุนสินค้า (COGS)</span>
          <Tag className="h-4 w-4 text-amber-500" />
        </div>
        <div className="mt-2 font-mono text-lg xl:text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
          ฿{formatTHB(summary.total_cost)}
        </div>
        <div className="mt-1 text-[11px] text-neutral-400">ตามวันที่มีผล ณ วันสั่งซื้อ</div>
      </div>

      {/* Net Profit */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>กำไรสุทธิ (Net Profit)</span>
          <DollarSign className="h-4 w-4 text-orange-500" />
        </div>
        <div
          className={`mt-2 font-mono text-lg xl:text-xl font-bold truncate ${
            summary.net_profit >= 0 ? "text-orange-600 dark:text-orange-400" : "text-rose-600"
          }`}
        >
          ฿{formatTHB(summary.net_profit)}
        </div>
        <div className="mt-1 text-[11px] text-neutral-400">ยอดรับจริง - ต้นทุนรวม</div>
      </div>

      {/* Profit Margin */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>อัตรากำไร (Margin %)</span>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </div>
        <div className="mt-2 font-mono text-lg xl:text-xl font-bold text-purple-600 dark:text-purple-400 truncate">
          {summary.profit_margin_pct.toFixed(2)}%
        </div>
        <div className="mt-1 text-[11px] text-neutral-400">เทียบยอดโอนสุทธิ</div>
      </div>
    </div>
  );
}

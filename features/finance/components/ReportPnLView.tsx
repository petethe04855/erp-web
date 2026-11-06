"use client";

import React from "react";
import type { ProfitAndLossReport } from "../types/finance";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface ReportPnLViewProps {
  report: ProfitAndLossReport | undefined;
  isLoading: boolean;
}

export function ReportPnLView({ report, isLoading }: ReportPnLViewProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
          กำลังคำนวณรายงานกำไร-ขาดทุน...
        </div>
      </div>
    );
  }

  if (!report) return null;

  const isProfitable = report.net_profit >= 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">รายได้จากการขาย (Revenue)</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-neutral-900">
            ฿{report.revenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">ต้นทุนขาย (COGS)</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-neutral-900">
            ฿{report.cogs.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">กำไรขั้นต้น (Gross Profit)</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-neutral-900">
            ฿{report.gross_profit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">กำไรสุทธิ (Net Profit)</span>
            <div className={`rounded-lg p-2 ${isProfitable ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              {isProfitable ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>
          <div className={`mt-3 font-mono text-2xl font-bold ${isProfitable ? "text-emerald-700" : "text-red-700"}`}>
            ฿{report.net_profit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Channel */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-neutral-500" />
            รายได้แยกตามช่องทาง (Revenue by Channel)
          </h3>
          <div className="space-y-3">
            {Object.entries(report.revenue_by_channel || {}).map(([ch, amt]) => {
              const pct = report.revenue > 0 ? (amt / report.revenue) * 100 : 0;
              return (
                <div key={ch} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-700">{ch}</span>
                    <span className="font-mono text-neutral-900 font-semibold">
                      ฿{amt.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(report.revenue_by_channel || {}).length === 0 && (
              <p className="text-xs text-neutral-500 py-4 text-center">ไม่มีข้อมูลรายได้ในช่วงเวลานี้</p>
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-neutral-500" />
            ค่าใช้จ่ายแยกตามหมวดหมู่ (Expenses by Category)
          </h3>
          <div className="space-y-3">
            {Object.entries(report.expense_by_category || {}).map(([cat, amt]) => {
              const pct = report.operating_expense > 0 ? (amt / report.operating_expense) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-700">{cat}</span>
                    <span className="font-mono text-neutral-900 font-semibold">
                      ฿{amt.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(report.expense_by_category || {}).length === 0 && (
              <p className="text-xs text-neutral-500 py-4 text-center">ไม่มีข้อมูลค่าใช้จ่ายในช่วงเวลานี้</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

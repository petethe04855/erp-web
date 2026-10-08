"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { TrendingUp, Award, BarChart3 } from "lucide-react";
import type { TiktokProvinceRow } from "../types/crm";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface ProvinceBarChartProps {
  provinces: TiktokProvinceRow[];
  isLoading?: boolean;
  onSelectProvince?: (province: string) => void;
  selectedProvince?: string;
}

type Metric = "orders" | "sales";

const BAR_COLOR = "#737373";
const BAR_HIGHLIGHT = "#F59E0B";

export function ProvinceBarChart({
  provinces,
  isLoading,
  onSelectProvince,
  selectedProvince,
}: ProvinceBarChartProps) {
  const [metric, setMetric] = useState<Metric>("orders");
  const isSales = metric === "sales";

  const top10 = provinces.slice(0, 10);
  // Chart rows are ranked by the selected metric
  const chartRows = [...provinces]
    .sort((a, b) => (isSales ? b.grossSales - a.grossSales : b.orderCount - a.orderCount))
    .slice(0, 10);
  const maxOrderCount = top10.length > 0 ? Math.max(...top10.map((p) => p.orderCount)) : 1;

  const barColor = (row: TiktokProvinceRow, index: number) =>
    selectedProvince === row.province || (!selectedProvince && index === 0)
      ? BAR_HIGHLIGHT
      : BAR_COLOR;

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    indexAxis: "y",
    onHover: (event, elements) => {
      if (event.native && event.native.target) {
        (event.native.target as HTMLElement).style.cursor = elements.length
          ? "pointer"
          : "default";
      }
    },
    onClick: (_event, elements) => {
      if (elements.length === 0) return;
      const row = chartRows[elements[0].index];
      if (!row) return;
      onSelectProvince?.(selectedProvince === row.province ? "" : row.province);
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const row = chartRows[ctx.dataIndex];
            if (!row) return "";
            return isSales
              ? `฿${row.grossSales.toLocaleString()} · ${row.orderCount} ออเดอร์`
              : `${row.orderCount} ออเดอร์ · ฿${row.grossSales.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(115,115,115,0.2)" },
        ticks: {
          color: "#737373",
          maxTicksLimit: 6,
          // Order counts are whole numbers — avoid fractional axis labels
          ...(isSales ? {} : { stepSize: 1 }),
          callback: (value) =>
            isSales
              ? `฿${Number(value).toLocaleString()}`
              : Number(value).toLocaleString(),
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#525252", font: { size: 11 } },
      },
    },
  };

  const data = {
    labels: chartRows.map((r) => r.province),
    datasets: [
      {
        label: isSales ? "ยอดขาย (บาท)" : "จำนวนออเดอร์",
        data: chartRows.map((r) => (isSales ? r.grossSales : r.orderCount)),
        backgroundColor: chartRows.map((r, i) => barColor(r, i)),
        hoverBackgroundColor: chartRows.map((r, i) =>
          barColor(r, i) === BAR_HIGHLIGHT ? BAR_HIGHLIGHT : "#525252",
        ),
        borderRadius: 4,
        maxBarThickness: 20,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="p-6 rounded-xl border border-neutral-200/80 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded mb-6" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-full" />
            ))}
          </div>
        </div>
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
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Real chart: top provinces by selected metric */}
      <div className="p-6 rounded-xl border border-neutral-200/80 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              จังหวัดที่คนสั่งเยอะสุด
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              คลิกที่แท่งเพื่อกรองดูข้อมูลเฉพาะจังหวัดนั้น
            </p>
          </div>
          <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setMetric("orders")}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                metric === "orders"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              ออเดอร์
            </button>
            <button
              type="button"
              onClick={() => setMetric("sales")}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors border-l border-neutral-200 dark:border-neutral-700 ${
                metric === "sales"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              ยอดขาย
            </button>
          </div>
        </div>

        <div className="h-[380px]">
          <Bar
            role="img"
            aria-label="กราฟอันดับจังหวัดที่มีออเดอร์หรือยอดขายสูงสุด 10 อันดับ"
            options={options}
            data={data}
          />
        </div>
      </div>

      {/* Ranked list with details */}
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
    </div>
  );
}

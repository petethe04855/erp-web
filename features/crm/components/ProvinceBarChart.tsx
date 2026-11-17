"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { TrendingUp } from "lucide-react";
import type { ProvinceRegionRow, TiktokProvinceRow } from "../types/crm";
import { UNKNOWN_PROVINCE } from "../constants/regions";
import { CHART_THEME, ChartCard } from "./ChartCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

interface ProvinceBarChartProps {
  provinces: TiktokProvinceRow[];
  regions: ProvinceRegionRow[];
  isLoading?: boolean;
}

const CYAN = "#06b6d4";
const CYAN_SOFT = "rgba(6, 182, 212, 0.6)";
const REGION_PALETTE = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

/** Top 10 provinces (bar) + regional share (doughnut), as in the geographic analytics tab. */
export function ProvinceBarChart({
  provinces,
  regions,
  isLoading,
}: ProvinceBarChartProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-[372px] animate-pulse rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
          />
        ))}
      </div>
    );
  }

  const top10 = provinces
    .filter((p) => p.province !== UNKNOWN_PROVINCE)
    .slice(0, 10);

  if (top10.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <TrendingUp className="mx-auto mb-2 h-10 w-10 text-neutral-400 opacity-50" />
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          ไม่พบข้อมูลออเดอร์ในช่วงเวลาที่เลือก
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          ลองปรับเปลี่ยนช่วงเวลาหรือตัวกรองสถานะคำสั่งซื้อ
        </p>
      </div>
    );
  }

  const leader = top10[0];
  const top3Share = top10.slice(0, 3).reduce((s, p) => s + p.sharePercent, 0);
  const others = top10
    .slice(1, 5)
    .map((p) => p.province)
    .join(", ");

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: CHART_THEME.tick }, grid: { display: false } },
      y: {
        ticks: { color: CHART_THEME.tick, callback: (v) => `${v}%` },
        grid: { color: CHART_THEME.gridY },
      },
    },
  };

  const barData = {
    labels: top10.map((p) => p.province),
    datasets: [
      {
        label: "สัดส่วนออเดอร์ (%)",
        data: top10.map((p) => p.sharePercent),
        backgroundColor: top10.map((_, i) => (i === 0 ? CYAN : CYAN_SOFT)),
        borderRadius: 6,
      },
    ],
  };

  // Regions sorted by orders; colors assigned by rank, as in the HTML.
  const regionRows = regions.filter((r) => r.orderCount > 0);
  const metroAndCentral = regionRows
    .filter((r) => r.region === "กรุงเทพฯ และปริมณฑล" || r.region === "ภาคกลาง")
    .reduce((s, r) => s + r.sharePercent, 0);

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { color: CHART_THEME.legend, font: { size: 10 } },
      },
    },
  };

  const doughnutData = {
    labels: regionRows.map((r) => r.region),
    datasets: [
      {
        data: regionRows.map((r) => r.orderCount),
        backgroundColor: REGION_PALETTE,
      },
    ],
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartCard
        title="🏙️ 10 จังหวัดที่มีฐานลูกค้าหนาแน่นที่สุด (Top 10 Provinces)"
        desc={`${leader.province} ครองสัดส่วน ${leader.sharePercent.toFixed(1)}%${others ? ` ตามด้วย ${others}` : ""} — 3 อันดับแรกรวม ${top3Share.toFixed(1)}%`}
      >
        <Bar
          role="img"
          aria-label="กราฟ 10 จังหวัดที่มีสัดส่วนออเดอร์สูงสุด"
          options={barOptions}
          data={barData}
        />
      </ChartCard>

      <ChartCard
        title="🌐 สัดส่วนฐานลูกค้าแยกตามภูมิภาคหลักของไทย"
        desc={`ภาคกลาง & กทม. ปริมณฑล ครองสัดส่วน ${metroAndCentral.toFixed(1)}% ของออเดอร์ทั้งหมด`}
      >
        <Doughnut
          role="img"
          aria-label="กราฟสัดส่วนออเดอร์แยกตามภูมิภาค"
          options={doughnutOptions}
          data={doughnutData}
        />
      </ChartCard>
    </div>
  );
}

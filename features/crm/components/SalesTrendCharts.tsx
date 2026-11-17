"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Chart, Line } from "react-chartjs-2";
import type { SalesTrendPoint } from "../types/crm";
import { CHART_THEME, ChartCard, ChartToggle } from "./ChartCard";
import { formatMonth, formatWeekRange, formatThaiDateShort } from "../utils/dateRange";

/** "2026-W14" -> "14" */
const weekNumber = (period: string) => String(Number(period.split("-W")[1] ?? ""));

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

// Colors from the analytics HTML
const SHOPEE = "#FF6B00";
const SHOPEE_BAR = "rgba(255, 107, 0, 0.85)";
const SHOPEE_BAR_SOFT = "rgba(255, 107, 0, 0.75)";
const TIKTOK = "#111827";
const TIKTOK_BAR = "rgba(17, 24, 39, 0.85)";
// Darker amber than the HTML's #fbbf24 so the line reads on a white background
const ORDERS = "#f59e0b";

const TICK = CHART_THEME.tick;
const LEGEND = CHART_THEME.legend;
const GRID_X = CHART_THEME.gridX;
const GRID_Y = CHART_THEME.gridY;

const bahtShort = (v: number | string) => {
  const n = Number(v);
  return "฿" + (n >= 1000 ? (n / 1000).toFixed(0) + "k" : n);
};

type WeeklyView = "stacked" | "orders";

interface WeeklySalesChartProps {
  weeks: SalesTrendPoint[];
  isLoading?: boolean;
  onSelectWeek?: (week: SalesTrendPoint) => void;
}

/** Weekly sales by channel (stacked bars) + total orders line, click a bar to drill into that week. */
export function WeeklySalesChart({ weeks, isLoading, onSelectWeek }: WeeklySalesChartProps) {
  const [view, setView] = useState<WeeklyView>("stacked");

  // X axis: week start date, e.g. "17 พ.ย. 25"; the tooltip shows the full week range.
  const labels = weeks.map((w) => formatThaiDateShort(w.startDate));

  const data: ChartData<"bar" | "line"> =
    view === "stacked"
      ? {
          labels,
          datasets: [
            { type: "bar", label: "🟠 Shopee", data: weeks.map((w) => w.shopeeSales), backgroundColor: SHOPEE_BAR, stack: "rev" },
            { type: "bar", label: "⚫ TikTok Shop", data: weeks.map((w) => w.tiktokSales), backgroundColor: TIKTOK_BAR, stack: "rev" },
            {
              type: "line",
              label: "📦 คำสั่งซื้อรวม (บิล)",
              data: weeks.map((w) => w.totalOrders),
              borderColor: ORDERS,
              backgroundColor: ORDERS,
              borderWidth: 2,
              pointRadius: 3,
              yAxisID: "yOrders",
            },
          ],
        }
      : {
          labels,
          datasets: [
            { type: "bar", label: "📦 คำสั่งซื้อ Shopee", data: weeks.map((w) => w.shopeeOrders), backgroundColor: SHOPEE_BAR_SOFT, stack: "ord" },
            { type: "bar", label: "⚫ คำสั่งซื้อ TikTok Shop", data: weeks.map((w) => w.tiktokOrders), backgroundColor: TIKTOK_BAR, stack: "ord" },
          ],
        };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    onClick: (_evt, elements) => {
      const w = elements.length ? weeks[elements[0].index] : undefined;
      if (w) onSelectWeek?.(w);
    },
    onHover: (evt, elements) => {
      const target = evt.native?.target as HTMLElement | undefined;
      if (target) target.style.cursor = elements.length && onSelectWeek ? "pointer" : "default";
    },
    plugins: {
      legend: { labels: { color: LEGEND, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          title: (items) => {
            const w = weeks[items[0]?.dataIndex ?? 0];
            return w
              ? `สัปดาห์ที่ ${weekNumber(w.period)} · ${formatWeekRange(w.startDate, w.endDate)}${onSelectWeek ? " 💡 คลิกเพื่อเจาะลึก" : ""}`
              : "";
          },
          label: (ctx) => {
            const name = ctx.dataset.label ? `${ctx.dataset.label}: ` : "";
            const y = ctx.parsed.y ?? 0;
            const isOrders = (ctx.dataset as { yAxisID?: string }).yAxisID === "yOrders" || view === "orders";
            return isOrders ? `${name}${y} บิล` : `${name}฿${y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, ticks: { color: TICK, font: { size: 10 } }, grid: { color: GRID_X } },
      y: {
        stacked: true,
        ticks: { color: TICK, callback: (v) => (view === "orders" ? `${v} บิล` : bahtShort(v)) },
        grid: { color: GRID_Y },
      },
      ...(view === "stacked"
        ? {
            yOrders: {
              position: "right" as const,
              grid: { drawOnChartArea: false },
              ticks: { color: "#d97706", callback: (v: number | string) => `${v} บิล` },
            },
          }
        : {}),
    },
  };

  return (
    <ChartCard
      title="📊 แนวโน้มยอดขายรายสัปดาห์และช่องทาง (คลิกแท่งกราฟเพื่อเจาะลึก)"
      desc="💡 เคล็ดลับ: สามารถคลิกที่แท่งกราฟสัปดาห์ใดก็ได้ เพื่อเปลี่ยนแดชบอร์ดทั้งหน้าให้เจาะลึกสัปดาห์นั้นทันที"
      height={350}
      actions={
        <ChartToggle<WeeklyView>
          value={view}
          onChange={setView}
          options={[
            { value: "stacked", label: "📊 ยอดขายแยกช่องทาง" },
            { value: "orders", label: "📦 จำนวนคำสั่งซื้อต่อสัปดาห์" },
          ]}
        />
      }
    >
      {isLoading ? (
        <div className="h-full w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      ) : (
        <Chart type="bar" role="img" aria-label="กราฟยอดขายรายสัปดาห์แยกตามช่องทาง" data={data} options={options} />
      )}
    </ChartCard>
  );
}

interface MonthlyTrendChartProps {
  months: SalesTrendPoint[];
  isLoading?: boolean;
}

/** Monthly sales trend per channel (filled lines). */
export function MonthlyTrendChart({ months, isLoading }: MonthlyTrendChartProps) {
  const data: ChartData<"line"> = {
    labels: months.map((m) => formatMonth(m.period)),
    datasets: [
      {
        label: "🟠 Shopee",
        data: months.map((m) => m.shopeeSales),
        borderColor: SHOPEE,
        backgroundColor: "rgba(255, 107, 0, 0.15)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "⚫ TikTok Shop",
        data: months.map((m) => m.tiktokSales),
        borderColor: TIKTOK,
        backgroundColor: "rgba(17, 24, 39, 0.08)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { color: LEGEND, font: { size: 11 } } },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ฿${(ctx.parsed.y ?? 0).toLocaleString()}` },
      },
    },
    scales: {
      x: { ticks: { color: TICK }, grid: { color: GRID_X } },
      y: { ticks: { color: TICK, callback: (v) => bahtShort(v) }, grid: { color: GRID_Y } },
    },
  };

  return (
    <ChartCard
      title="📊 สัดส่วนและแนวโน้มยอดขายรายเดือน (Shopee vs TikTok Shop)"
      desc="ติดตามการเปลี่ยนแปลงพอร์ตรายได้ตลอดทั้งปี"
      height={280}
    >
      {isLoading ? (
        <div className="h-full w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      ) : (
        <Line role="img" aria-label="กราฟแนวโน้มยอดขายรายเดือนแยกตามช่องทาง" data={data} options={options} />
      )}
    </ChartCard>
  );
}

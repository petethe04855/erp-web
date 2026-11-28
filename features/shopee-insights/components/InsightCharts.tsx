"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  type Plugin,
  type ChartOptions,
} from "chart.js";
import { Chart, Line } from "react-chartjs-2";
import { AMOUNT_COLOR, AMOUNT_DASH, CATEGORY_COLORS, COUNT_COLOR, setColor } from "../lib/colors";
import { baht, monthLabel, num } from "../lib/format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const TICK = "#737373";
const GRID = "rgba(115,115,115,0.15)";

/** Prints each bar's value above it, so the chart reads without hovering (spec §6). */
const barValues: Plugin = {
  id: "insightBarValues",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.save();
    ctx.font = "600 11px system-ui, sans-serif";
    ctx.fillStyle = TICK;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    chart.data.datasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i);
      if (meta.type !== "bar" || meta.hidden) return;
      meta.data.forEach((el, j) => {
        const v = Number(ds.data[j]);
        if (!v) return;
        ctx.fillText(num(v), el.x, el.y - 3);
      });
    });
    ctx.restore();
  },
};

const legend = {
  display: true,
  position: "bottom" as const,
  labels: { boxWidth: 18, boxHeight: 2, color: TICK },
};

function dualAxis(left: string, right: string, rightMax?: number): ChartOptions<"line">["scales"] {
  return {
    x: { grid: { display: false }, ticks: { color: TICK } },
    y: {
      position: "left",
      beginAtZero: true,
      grid: { color: GRID },
      ticks: { color: TICK, precision: 0 },
      title: { display: true, text: left, color: TICK },
    },
    y1: {
      position: "right",
      beginAtZero: true,
      max: rightMax,
      grid: { display: false },
      ticks: { color: TICK, callback: (v) => (rightMax === 100 ? `${v}%` : baht(Number(v))) },
      title: { display: true, text: right, color: TICK },
    },
  };
}

const countLine = (label: string, data: number[], color = COUNT_COLOR) => ({
  type: "line" as const,
  label,
  data,
  yAxisID: "y",
  borderColor: color,
  backgroundColor: color,
  borderWidth: 2,
  pointRadius: 3,
  tension: 0.25,
});

const amountLine = (label: string, data: number[], color = AMOUNT_COLOR) => ({
  type: "line" as const,
  label,
  data,
  yAxisID: "y1",
  borderColor: color,
  backgroundColor: color,
  borderDash: AMOUNT_DASH,
  borderWidth: 2,
  pointRadius: 2,
  tension: 0.25,
});

const bahtTooltip = (axis: string) => (item: { dataset: { label?: string; yAxisID?: string }; raw: unknown }) =>
  `${item.dataset.label}: ${item.dataset.yAxisID === axis ? `฿${baht(Number(item.raw))}` : num(Number(item.raw))}`;

/** Sales and orders per month: solid = orders (left), dashed = baht (right). */
export function MonthlySalesChart({ monthly }: { monthly: { month: string; sales: number; orders: number }[] }) {
  return (
    <div className="h-72">
      <Line
        role="img"
        aria-label="กราฟยอดขายและจำนวนออเดอร์รายเดือน"
        data={{
          labels: monthly.map((m) => monthLabel(m.month, false)),
          datasets: [countLine("ออเดอร์", monthly.map((m) => m.orders)), amountLine("ยอดขาย (บาท)", monthly.map((m) => m.sales))],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: "index", intersect: false },
          scales: dualAxis("ออเดอร์", "บาท"),
          plugins: { legend, tooltip: { callbacks: { label: bahtTooltip("y1") } } },
        }}
      />
    </div>
  );
}

const CATEGORY_LINES = ["ฟรีซดรายโปรผสม", "ฟรีซดรายชนิดเดี่ยว", "ของเล่นแมว"];

/** Sales per month for each product category (3 lines, baht). */
export function CategoryChart({ months, rows }: { months: string[]; rows: { month: string; category: string; sales: number }[] }) {
  const value = (m: string, c: string) => rows.find((r) => r.month === m && r.category === c)?.sales ?? 0;
  return (
    <div className="h-72">
      <Line
        role="img"
        aria-label="กราฟยอดขายรายเดือนตามหมวดสินค้า"
        data={{
          labels: months.map((m) => monthLabel(m, false)),
          datasets: CATEGORY_LINES.map((c) => ({
            label: c,
            data: months.map((m) => value(m, c)),
            borderColor: CATEGORY_COLORS[c],
            backgroundColor: CATEGORY_COLORS[c],
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.25,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            x: { grid: { display: false }, ticks: { color: TICK } },
            y: { beginAtZero: true, grid: { color: GRID }, ticks: { color: TICK, callback: (v) => baht(Number(v)) } },
          },
          plugins: {
            legend,
            tooltip: { callbacks: { label: (i) => `${i.dataset.label}: ฿${baht(Number(i.raw))}` } },
          },
        }}
      />
    </div>
  );
}

/**
 * Freeze-dried sets per month by set size: solid = sets sold (left), dashed =
 * baht (right), one colour per set size; sizes can be switched off.
 */
export function SetSizeChart({
  months,
  sizes,
  rows,
  visible,
}: {
  months: string[];
  sizes: number[];
  rows: { month: string; set: number; sets_sold: number; sales: number }[];
  visible: number[];
}) {
  const at = (m: string, s: number) => rows.find((r) => r.month === m && r.set === s);
  const shown = sizes.filter((s) => visible.includes(s));
  return (
    <div className="h-80">
      <Line
        role="img"
        aria-label="กราฟจำนวนเซตและยอดขายฟรีซดรายรายเดือน แยกตามขนาดเซต"
        data={{
          labels: months.map((m) => monthLabel(m, false)),
          datasets: shown.flatMap((s) => [
            countLine(`${s} ถุง · เซต`, months.map((m) => at(m, s)?.sets_sold ?? 0), setColor(s)),
            amountLine(`${s} ถุง · บาท`, months.map((m) => at(m, s)?.sales ?? 0), setColor(s)),
          ]),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: "index", intersect: false },
          scales: dualAxis("จำนวนเซต", "บาท"),
          plugins: { legend, tooltip: { callbacks: { label: bahtTooltip("y1") } } },
        }}
      />
    </div>
  );
}

interface BarLineProps {
  ariaLabel: string;
  labels: string[];
  bars: { label: string; data: number[] };
  line: { label: string; data: number[]; percent?: boolean };
  leftTitle: string;
  rightTitle: string;
}

/** Groups on the x axis: bars = count (left, values printed), dashed line = baht or % (right). */
export function BarLineChart({ ariaLabel, labels, bars, line, leftTitle, rightTitle }: BarLineProps) {
  const scales = dualAxis(leftTitle, rightTitle, line.percent ? 100 : undefined) as ChartOptions<"bar">["scales"];
  return (
    <div className="h-72">
      <Chart
        type="bar"
        role="img"
        aria-label={ariaLabel}
        plugins={[barValues]}
        data={{
          labels,
          datasets: [
            {
              type: "bar" as const,
              label: bars.label,
              data: bars.data,
              yAxisID: "y",
              backgroundColor: "#d4d4d4",
              hoverBackgroundColor: "#a3a3a3",
              borderRadius: 3,
              maxBarThickness: 48,
              order: 2,
            },
            { ...amountLine(line.label, line.data), order: 1 },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          layout: { padding: { top: 16 } },
          interaction: { mode: "index", intersect: false },
          scales,
          plugins: {
            legend,
            tooltip: {
              callbacks: {
                label: (i) =>
                  i.dataset.yAxisID === "y1"
                    ? `${i.dataset.label}: ${line.percent ? `${Number(i.raw).toFixed(1)}%` : `฿${baht(Number(i.raw))}`}`
                    : `${i.dataset.label}: ${num(Number(i.raw))}`,
              },
            },
          },
        }}
      />
    </div>
  );
}

/** A plain data table behind a chart, for screen readers and exact numbers. */
export function ChartTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-4 text-xs text-neutral-500">
      <summary className="cursor-pointer">ดูข้อมูลกราฟแบบตาราง</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={h} className={`py-1 font-medium ${i ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={`py-0.5 ${j ? "text-right tabular-nums" : ""}`}>
                    {typeof c === "number" ? num(c) : c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

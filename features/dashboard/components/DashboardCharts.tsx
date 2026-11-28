"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import { BarChart3, Landmark, PieChart } from "lucide-react";
import type { DashboardData, Platform } from "../types/dashboard";
import { buildDailySeries, PLATFORM_META, type ShopeeDailyPoint } from "../lib/platforms";
import { formatThaiMonth, weeklyBuckets, type SalesBucket } from "../lib/metrics";
import { SectionCard, SegmentedControl } from "./SectionCard";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);
const shades = ["#171717", "#737373", "#b5b5b5", "#dedede"];

const axisOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false as const,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#737373", maxTicksLimit: 10 },
    },
    y: {
      beginAtZero: true,
      grid: { color: "#f0f0f0" },
      ticks: { color: "#737373" },
    },
  },
};

const baht = (v: number) => v.toLocaleString("th-TH", { maximumFractionDigits: 2 });

const SOURCE_NOTE: Record<Platform, string> = {
  tiktok: "TikTok สถานะจัดส่ง/สำเร็จ",
  shopee: "Shopee ยอดขายรวมตามวันที่โอนเงิน",
  manual: "อื่นๆ จาก Invoice ที่ชำระแล้ว",
};

type Granularity = "daily" | "weekly";
const GRANULARITY_OPTIONS = [
  { id: "daily", label: "รายวัน" },
  { id: "weekly", label: "รายสัปดาห์" },
] as const;

interface PlatformSalesChartsProps {
  month: string;
  platforms: Platform[];
  data?: DashboardData;
  shopeeDaily: ShopeeDailyPoint[];
  /** Shown when the Shopee data does not cover the selected month. */
  shopeeNotice?: string;
  /** Year view: one bucket per month, drawn as stacked bars instead of the daily line. */
  monthly?: SalesBucket[];
}

/**
 * Sales per platform by day (lines) or by week (stacked bars) for a month, or
 * by month (stacked bars) for a year, and each platform's share.
 */
export function PlatformSalesCharts({ month, platforms, data, shopeeDaily, shopeeNotice, monthly }: PlatformSalesChartsProps) {
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const { labels, series, totals: dailyTotals } = buildDailySeries(month, platforms, data, shopeeDaily);
  const buckets = monthly ?? weeklyBuckets(labels, series, platforms, []);
  const totals: Partial<Record<Platform, number>> = monthly
    ? Object.fromEntries(platforms.map((p) => [p, monthly.reduce((sum, b) => sum + (b.totals[p] ?? 0), 0)]))
    : dailyTotals;
  const hasSales = platforms.some((p) => (totals[p] ?? 0) > 0);
  const shares = platforms.filter((p) => (totals[p] ?? 0) > 0);
  const bars = !!monthly || granularity === "weekly";

  const xLabels = bars ? buckets.map((b) => b.label) : labels.map((d) => String(parseInt(d.slice(8), 10)));
  const fullLabel = (i: number) => {
    if (!bars) return labels[i];
    const b = buckets[i];
    return b.range ? `${b.label} (${b.range})` : formatThaiMonth(b.from.slice(0, 7));
  };
  const valueAt = (p: Platform, i: number) => (bars ? (buckets[i].totals[p] ?? 0) : (series[p]?.[i] ?? 0));
  const tooltip = {
    callbacks: {
      title: (items: { dataIndex: number }[]) => (items[0] ? fullLabel(items[0].dataIndex) : ""),
      label: (item: { dataset: { label?: string }; raw: unknown }) => `${item.dataset.label}: ฿${baht(Number(item.raw))}`,
    },
  };
  const legend = {
    display: true,
    position: "bottom" as const,
    labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true },
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <SectionCard
        className="lg:col-span-2"
        icon={BarChart3}
        title={
          monthly
            ? "ยอดขายรายเดือน แยกแพลตฟอร์ม"
            : bars
              ? "ยอดขายรายสัปดาห์ แยกแพลตฟอร์ม"
              : "ยอดขายตามวันที่ แยกแพลตฟอร์ม"
        }
        description={`${platforms.map((p) => SOURCE_NOTE[p]).join(" · ")} · บาท`}
        actions={
          !monthly && (
          <SegmentedControl
            label="มุมมองกราฟยอดขาย"
            value={granularity}
            options={GRANULARITY_OPTIONS}
            onChange={setGranularity}
          />
          )
        }
      >
        {shopeeNotice && (
          <p className="mb-3 rounded-md bg-orange-50 px-3 py-1.5 text-[11px] text-orange-800 dark:bg-orange-950/30 dark:text-orange-300">
            {shopeeNotice}
          </p>
        )}
        <div className="h-72">
          {!hasSales ? (
            <div className="h-full flex items-center justify-center text-sm text-neutral-500">
              ยังไม่มียอดขายของแพลตฟอร์มที่เลือกในช่วงนี้
            </div>
          ) : bars ? (
            <Bar
              role="img"
              aria-label={monthly ? "กราฟยอดขายรายเดือนแยกตามแพลตฟอร์ม" : "กราฟยอดขายรายสัปดาห์แยกตามแพลตฟอร์ม"}
              options={{
                ...axisOptions,
                scales: {
                  x: { ...axisOptions.scales.x, stacked: true },
                  y: { ...axisOptions.scales.y, stacked: true },
                },
                interaction: { mode: "index" as const, intersect: false },
                plugins: { legend, tooltip },
              }}
              data={{
                labels: xLabels,
                datasets: platforms.map((p) => ({
                  label: PLATFORM_META[p].label,
                  data: buckets.map((b) => b.totals[p] ?? 0),
                  backgroundColor: PLATFORM_META[p].color,
                  borderRadius: 3,
                  maxBarThickness: 56,
                })),
              }}
            />
          ) : (
            <Line
              role="img"
              aria-label="กราฟยอดขายรายวันแยกตามแพลตฟอร์ม TikTok, Shopee และอื่นๆ"
              options={{
                ...axisOptions,
                interaction: { mode: "index" as const, intersect: false },
                plugins: { legend, tooltip },
              }}
              data={{
                labels: xLabels,
                datasets: platforms.map((p) => ({
                  label: PLATFORM_META[p].label,
                  data: series[p] ?? [],
                  borderColor: PLATFORM_META[p].color,
                  backgroundColor: PLATFORM_META[p].color,
                  fill: false,
                  tension: 0.25,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                  borderWidth: 2,
                })),
              }}
            />
          )}
        </div>
        <details className="text-xs text-neutral-500 mt-4">
          <summary className="cursor-pointer">ดูข้อมูลกราฟแบบตาราง</summary>
          <table className="w-full mt-2">
            <thead>
              <tr>
                <th className="text-left font-medium">{monthly ? "เดือน" : bars ? "สัปดาห์" : "วันที่"}</th>
                {platforms.map((p) => (
                  <th key={p} className="text-right font-medium">
                    {PLATFORM_META[p].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {xLabels.map((_, i) =>
                platforms.some((p) => valueAt(p, i) > 0) ? (
                  <tr key={i}>
                    <td>{fullLabel(i)}</td>
                    {platforms.map((p) => (
                      <td key={p} className="text-right tabular-nums">
                        {baht(valueAt(p, i))}
                      </td>
                    ))}
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </details>
      </SectionCard>

      <SectionCard icon={PieChart} title="สัดส่วนยอดขายตามแพลตฟอร์ม" description={monthly ? "ยอดขายของปีที่เลือก" : "ยอดขายของเดือนที่เลือก"}>
        <div className="h-56">
          {shares.length ? (
            <Pie
              role="img"
              aria-label="สัดส่วนยอดขายตามแพลตฟอร์ม"
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (item) => {
                        const sum = item.dataset.data.reduce((a, b) => a + Number(b), 0);
                        const v = Number(item.raw);
                        const pct = sum > 0 ? Math.round((v / sum) * 100) : 0;
                        return `${item.label}: ฿${baht(v)} (${pct}%)`;
                      },
                    },
                  },
                },
              }}
              data={{
                labels: shares.map((p) => PLATFORM_META[p].label),
                datasets: [
                  {
                    data: shares.map((p) => totals[p] ?? 0),
                    backgroundColor: shares.map((p) => PLATFORM_META[p].color),
                    borderColor: "#ffffff",
                    borderWidth: 2,
                  },
                ],
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-neutral-500">
              ไม่มีข้อมูลยอดขาย
            </div>
          )}
        </div>
        <ul className="space-y-3 mt-5">
          {platforms.map((p) => (
            <li key={p} className="flex justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_META[p].color }} />
                {PLATFORM_META[p].label}
              </span>
              <span className="tabular-nums">{baht(totals[p] ?? 0)}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

/** Revenue, cost, expenses and net profit from posted journal entries. */
export function AccountingChart({ data }: { data: DashboardData }) {
  return (
    <SectionCard
      icon={Landmark}
      title="รายได้และต้นทุนจากบัญชี"
      description="ยอดจากรายการ Journal ที่ Posted ในช่วงที่เลือก"
    >
      <div className="h-56">
        <Bar
          role="img"
          aria-label="เปรียบเทียบรายได้ ต้นทุน ค่าใช้จ่าย และกำไรสุทธิจากบัญชี"
          options={{ ...axisOptions, plugins: { legend: { display: false } } }}
          data={{
            labels: ["รายได้สุทธิ", "ต้นทุนขาย", "ค่าใช้จ่ายดำเนินงาน", "กำไรสุทธิ"],
            datasets: [
              {
                label: "บาท",
                data: [
                  data.financial.revenue,
                  data.financial.cogs,
                  data.financial.operatingExpenses,
                  data.financial.netProfit,
                ],
                backgroundColor: shades,
                borderColor: shades,
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 80,
              },
            ],
          }}
        />
      </div>
    </SectionCard>
  );
}

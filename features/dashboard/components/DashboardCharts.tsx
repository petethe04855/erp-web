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
import { Line, Pie, Bar } from "react-chartjs-2";
import type { DashboardData, Platform } from "../types/dashboard";
import { buildDailySeries, PLATFORM_META, type ShopeeDailyPoint } from "../lib/platforms";
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

interface PlatformSalesChartsProps {
  month: string;
  platforms: Platform[];
  data?: DashboardData;
  shopeeDaily: ShopeeDailyPoint[];
  /** Shown when the Shopee data does not cover the selected month. */
  shopeeNotice?: string;
}

/** Daily sales per platform (one line each) and each platform's share. */
export function PlatformSalesCharts({ month, platforms, data, shopeeDaily, shopeeNotice }: PlatformSalesChartsProps) {
  const { labels, series, totals } = buildDailySeries(month, platforms, data, shopeeDaily);
  const hasSales = platforms.some((p) => (totals[p] ?? 0) > 0);
  const shares = platforms.filter((p) => (totals[p] ?? 0) > 0);
  const dayLabels = labels.map((d) => String(parseInt(d.slice(8), 10)));

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="min-w-0 border rounded-xl bg-white p-6 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="font-semibold">ยอดขายตามวันที่ แยกแพลตฟอร์ม</h2>
            <p className="text-xs text-neutral-500 mt-1">
              {platforms.map((p) => SOURCE_NOTE[p]).join(" · ")} · บาท
            </p>
          </div>
          <span className="text-[10px] tracking-widest text-neutral-400">REVENUE</span>
        </div>
        {shopeeNotice && (
          <p className="mb-3 rounded-md bg-orange-50 px-3 py-1.5 text-[11px] text-orange-800 dark:bg-orange-950/30 dark:text-orange-300">
            {shopeeNotice}
          </p>
        )}
        <div className="h-72">
          {hasSales ? (
            <Line
              role="img"
              aria-label="กราฟยอดขายรายวันแยกตามแพลตฟอร์ม TikTok, Shopee และอื่นๆ"
              options={{
                ...axisOptions,
                interaction: { mode: "index" as const, intersect: false },
                plugins: {
                  legend: {
                    display: true,
                    position: "bottom" as const,
                    labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true },
                  },
                  tooltip: {
                    callbacks: {
                      title: (items) => (items[0] ? labels[items[0].dataIndex] : ""),
                      label: (item) => `${item.dataset.label}: ฿${baht(Number(item.raw))}`,
                    },
                  },
                },
              }}
              data={{
                labels: dayLabels,
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
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-neutral-500">
              ยังไม่มียอดขายของแพลตฟอร์มที่เลือกในเดือนนี้
            </div>
          )}
        </div>
        <details className="text-xs text-neutral-500 mt-4">
          <summary className="cursor-pointer">ดูข้อมูลกราฟแบบตาราง</summary>
          <table className="w-full mt-2">
            <thead>
              <tr>
                <th className="text-left font-medium">วันที่</th>
                {platforms.map((p) => (
                  <th key={p} className="text-right font-medium">
                    {PLATFORM_META[p].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((d, i) =>
                platforms.some((p) => (series[p]?.[i] ?? 0) > 0) ? (
                  <tr key={d}>
                    <td>{d}</td>
                    {platforms.map((p) => (
                      <td key={p} className="text-right tabular-nums">
                        {baht(series[p]?.[i] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </details>
      </section>

      <section className="min-w-0 border rounded-xl bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold">สัดส่วนยอดขายตามแพลตฟอร์ม</h2>
        <p className="text-xs text-neutral-500 mt-1">ยอดขายของเดือนที่เลือก</p>
        <div className="h-56 mt-6">
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
      </section>
    </div>
  );
}

/** Revenue, cost, expenses and net profit from posted journal entries. */
export function AccountingChart({ data }: { data: DashboardData }) {
  return (
    <section className="min-w-0 border rounded-xl bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="font-semibold">รายได้และต้นทุนจากบัญชี</h2>
      <p className="text-xs text-neutral-500 mt-1 mb-6">
        ยอดจากรายการ Journal ที่ Posted ในเดือนที่เลือก
      </p>
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
    </section>
  );
}

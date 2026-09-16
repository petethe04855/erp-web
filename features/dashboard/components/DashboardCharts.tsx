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
import { Line, Doughnut, Bar } from "react-chartjs-2";
import type { DashboardData } from "../types/dashboard";
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

const CHANNEL_COLORS: Record<string, string> = {
  TikTok: "#000000",
  Manual: "#3B82F6",
};

function getChannelColor(name: string, index: number): string {
  return CHANNEL_COLORS[name] || shades[index % shades.length];
}

function normalizeChannelName(raw: string): string {
  const upper = (raw || "").toUpperCase().trim();
  if (upper.includes("TIKTOK") || upper.includes("TIK TOK")) return "TikTok";
  if (upper.includes("MANUAL") || upper === "DIRECT" || !upper) return "Manual";
  return raw.trim();
}

export function DashboardCharts({ data }: { data: DashboardData }) {
  const days = new Map<string, number>();
  data.revenue.rows.forEach((r) =>
    days.set(r.date, (days.get(r.date) || 0) + r.amount),
  );
  const labels = [...days.keys()].sort();

  const channelTotals = new Map<string, number>();
  Object.entries(data.revenue.byChannel || {}).forEach(([rawName, amount]) => {
    if (amount <= 0) return;
    const name = normalizeChannelName(rawName);
    channelTotals.set(name, (channelTotals.get(name) || 0) + amount);
  });

  const channels = [...channelTotals.entries()].sort((a, b) => b[1] - a[1]);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#737373", maxTicksLimit: 8 },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0" },
        ticks: { color: "#737373" },
      },
    },
  };
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="min-w-0 border rounded-xl bg-white p-6 lg:col-span-2">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="font-semibold">ยอดขายตามวันที่</h2>
            <p className="text-xs text-neutral-500 mt-1">
              TikTok สำเร็จ · Manual ชำระเงินแล้ว · บาท
            </p>
          </div>
          <span className="text-[10px] tracking-widest text-neutral-400">
            REVENUE
          </span>
        </div>
        <div className="h-72">
          {labels.length ? (
            <Line
              role="img"
              aria-label="กราฟยอดขายจาก TikTok ที่สำเร็จและ Manual ที่ชำระเงินแล้ว"
              options={options}
              data={{
                labels,
                datasets: [
                  {
                    label: "ยอดขาย",
                    data: labels.map((d) => days.get(d)!),
                    borderColor: shades[0],
                    backgroundColor: "rgba(0,0,0,0.04)",
                    fill: true,
                    tension: 0.25,
                    pointRadius: 3,
                    borderWidth: 2,
                  },
                ],
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-neutral-500">
              ยังไม่มี TikTok ที่สำเร็จหรือ Manual ที่ชำระแล้วในเดือนนี้
            </div>
          )}
        </div>
        <details className="text-xs text-neutral-500 mt-4">
          <summary className="cursor-pointer">ดูข้อมูลกราฟแบบตาราง</summary>
          <table className="w-full mt-2">
            <tbody>
              {labels.map((d) => (
                <tr key={d}>
                  <td>{d}</td>
                  <td className="text-right">
                    {days.get(d)?.toLocaleString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>
      <section className="min-w-0 border rounded-xl bg-white p-6">
        <h2 className="font-semibold">ช่องทางการขาย</h2>
        <p className="text-xs text-neutral-500 mt-1">
          Manual จาก Invoice ที่ชำระแล้ว · TikTok สถานะสำเร็จ
        </p>
        <div className="h-56 mt-6">
          {channels.length ? (
            <Doughnut
              role="img"
              aria-label="สัดส่วนยอดขายตามช่องทาง"
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                cutout: "76%",
                plugins: { legend: { display: false } },
              }}
              data={{
                labels: channels.map(([name]) => name),
                datasets: [
                  {
                    data: channels.map(([, v]) => v),
                    backgroundColor: channels.map(([name], i) =>
                      getChannelColor(name, i),
                    ),
                    borderColor: "#ffffff",
                    borderWidth: 5,
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
          {channels.map(([name, value], i) => (
            <li key={name} className="flex justify-between text-xs">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: getChannelColor(name, i) }}
                />
                {name}
              </span>
              <span className="tabular-nums">
                {value.toLocaleString("th-TH", { maximumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="min-w-0 border rounded-xl bg-white p-6 lg:col-span-3">
        <h2 className="font-semibold">รายได้และต้นทุนจากบัญชี</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-6">
          ยอดจากรายการ Journal ที่ Posted ในเดือนที่เลือก
        </p>
        <div className="h-56">
          <Bar
            role="img"
            aria-label="เปรียบเทียบรายได้ ต้นทุน ค่าใช้จ่าย และกำไรสุทธิจากบัญชี"
            options={options}
            data={{
              labels: [
                "รายได้สุทธิ",
                "ต้นทุนขาย",
                "ค่าใช้จ่ายดำเนินงาน",
                "กำไรสุทธิ",
              ],
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
    </div>
  );
}

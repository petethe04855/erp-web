"use client";

import React, { useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ListOrdered, Search, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PLATFORM_META } from "../lib/platforms";
import { formatThaiDay, type CustomerStat } from "../lib/metrics";
import { SectionCard } from "./SectionCard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const baht = (v: number) => v.toLocaleString("th-TH", { maximumFractionDigits: 2 });
const short = (name: string) => (name.length > 22 ? `${name.slice(0, 21)}…` : name);

/** Top 10 customers by amount, coloured by the platform they bought on most. */
export function TopCustomersChart({ customers }: { customers: CustomerStat[] }) {
  const top = customers.slice(0, 10);
  const used = [...new Set(top.map((c) => c.mainPlatform))];

  return (
    <SectionCard
      icon={Trophy}
      title="Top 10 ลูกค้าที่มียอดซื้อสูงสุด"
      description="จากรายการขาย TikTok และ Manual ในช่วงที่เลือก (Shopee ไม่มีข้อมูลรายลูกค้า)"
      actions={
        used.length > 0 && (
          <ul className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
            {used.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_META[p].color }} />
                {PLATFORM_META[p].label}
              </li>
            ))}
          </ul>
        )
      }
    >
      <div className="h-80">
        {top.length ? (
          <Bar
            role="img"
            aria-label="กราฟแท่งลูกค้า 10 อันดับแรกตามยอดซื้อ"
            options={{
              indexAxis: "y" as const,
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: (items) => (items[0] ? top[items[0].dataIndex].name : ""),
                    label: (item) => {
                      const c = top[item.dataIndex];
                      return `฿${baht(c.amount)} · ${c.orders} บิล · ${c.share.toFixed(1)}%`;
                    },
                  },
                },
              },
              scales: {
                x: { beginAtZero: true, grid: { color: "#f0f0f0" }, ticks: { color: "#737373" } },
                y: { grid: { display: false }, ticks: { color: "#404040" } },
              },
            }}
            data={{
              labels: top.map((c) => short(c.name)),
              datasets: [
                {
                  label: "ยอดซื้อ (บาท)",
                  data: top.map((c) => c.amount),
                  backgroundColor: top.map((c) => PLATFORM_META[c.mainPlatform].color),
                  borderRadius: 4,
                  maxBarThickness: 22,
                },
              ],
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            ยังไม่มีรายการขายที่ระบุชื่อลูกค้าในช่วงนี้
          </div>
        )}
      </div>
    </SectionCard>
  );
}

const PAGE = 20;

/** Every named customer, ranked, with a name search. */
export function CustomerRankingTable({ customers }: { customers: CustomerStat[] }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(() => customers.map((c, i) => ({ ...c, rank: i + 1 })), [customers]);
  const q = query.trim().toLowerCase();
  const matches = q ? ranked.filter((c) => c.name.toLowerCase().includes(q)) : ranked;
  const visible = showAll || q ? matches : matches.slice(0, PAGE);

  return (
    <SectionCard
      flush
      icon={ListOrdered}
      title="ตารางจัดอันดับลูกค้า"
      description={`ลูกค้าที่ระบุชื่อ ${customers.length.toLocaleString("th-TH")} ราย · เรียงตามยอดซื้อ`}
      actions={
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            aria-label="ค้นหาชื่อลูกค้า"
            placeholder="ค้นหาชื่อลูกค้า…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      }
    >
      <div className="max-h-[480px] overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-neutral-50 text-neutral-500 dark:bg-neutral-800">
            <tr>
              <th className="w-14 px-5 py-2.5 text-center font-medium">อันดับ</th>
              <th className="px-3 py-2.5 text-left font-medium">ลูกค้า</th>
              <th className="px-3 py-2.5 text-left font-medium">ช่องทาง</th>
              <th className="px-3 py-2.5 text-right font-medium">บิล</th>
              <th className="px-3 py-2.5 text-right font-medium">ยอดซื้อรวม</th>
              <th className="px-3 py-2.5 text-right font-medium">เฉลี่ย/บิล</th>
              <th className="w-40 px-3 py-2.5 text-left font-medium">สัดส่วน</th>
              <th className="px-5 py-2.5 text-right font-medium">ซื้อล่าสุด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {visible.map((c) => (
              <tr key={c.name} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                <td className="px-5 py-2.5 text-center">
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${
                      c.rank <= 3
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500"
                    }`}
                  >
                    {c.rank}
                  </span>
                </td>
                <td className="max-w-[240px] truncate px-3 py-2.5 font-medium text-neutral-800 dark:text-neutral-200" title={c.name}>
                  {c.name}
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex flex-wrap gap-1">
                    {c.platforms.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${PLATFORM_META[p].dot}`} />
                        {PLATFORM_META[p].label}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{c.orders.toLocaleString("th-TH")}</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                  ฿{baht(c.amount)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-neutral-600 dark:text-neutral-400">
                  ฿{baht(c.orders ? c.amount / c.orders : 0)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(c.share, 100)}%`, backgroundColor: PLATFORM_META[c.mainPlatform].color }}
                      />
                    </div>
                    <span className="w-11 text-right tabular-nums text-neutral-500">{c.share.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right text-neutral-500">{c.lastDate ? formatThaiDay(c.lastDate) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="p-8 text-center text-sm text-neutral-500">
            {q ? `ไม่พบลูกค้าที่ชื่อมี "${query.trim()}"` : "ยังไม่มีรายการขายที่ระบุชื่อลูกค้าในช่วงนี้"}
          </p>
        )}
      </div>
      {!q && matches.length > PAGE && (
        <div className="border-t border-neutral-100 px-5 py-2.5 text-center dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="cursor-pointer text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400"
          >
            {showAll ? `แสดงเฉพาะ ${PAGE} อันดับแรก` : `แสดงทั้งหมด (${matches.length.toLocaleString("th-TH")} ราย)`}
          </button>
        </div>
      )}
    </SectionCard>
  );
}

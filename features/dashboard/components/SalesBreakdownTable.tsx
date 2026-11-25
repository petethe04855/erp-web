import React from "react";
import { CalendarRange } from "lucide-react";
import type { Platform } from "../types/dashboard";
import { PLATFORM_META } from "../lib/platforms";
import type { SalesBucket } from "../lib/metrics";
import { SectionCard } from "./SectionCard";

const baht = (v: number) => v.toLocaleString("th-TH", { maximumFractionDigits: 2 });

interface SalesBreakdownTableProps {
  title: string;
  description: string;
  /** Header of the first column ("สัปดาห์" / "เดือน"). */
  unit: string;
  /** Footer label ("รวมทั้งเดือน" / "รวมทั้งปี"). */
  totalLabel: string;
  buckets: SalesBucket[];
  platforms: Platform[];
  /** Key of the best bucket, highlighted. */
  peakKey: number | null;
  /** Whether the bill column applies (TikTok or Manual selected). */
  showOrders: boolean;
}

/** One row per week (or month): sales per platform, total, bills and share of the period. */
export function SalesBreakdownTable({
  title,
  description,
  unit,
  totalLabel,
  buckets,
  platforms,
  peakKey,
  showOrders,
}: SalesBreakdownTableProps) {
  const grand = buckets.reduce((sum, b) => sum + b.total, 0);
  const orders = buckets.reduce((sum, b) => sum + b.orders, 0);
  const th = "px-3 py-2.5 text-right font-medium";
  const td = "px-3 py-2.5 text-right tabular-nums";

  return (
    <SectionCard flush icon={CalendarRange} title={title} description={description}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-800/50">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">{unit}</th>
              {platforms.map((p) => (
                <th key={p} className={th}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${PLATFORM_META[p].dot}`} />
                    {PLATFORM_META[p].label}
                  </span>
                </th>
              ))}
              <th className={th}>รวม</th>
              {showOrders && <th className={th}>บิล (TikTok/Manual)</th>}
              <th className="w-40 px-5 py-2.5 text-left font-medium">สัดส่วน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {buckets.map((b) => {
              const share = grand > 0 ? (b.total / grand) * 100 : 0;
              const peak = b.key === peakKey;
              return (
                <tr
                  key={b.key}
                  className={peak ? "bg-neutral-50 dark:bg-neutral-800/40" : "hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"}
                >
                  <td className="whitespace-nowrap px-5 py-2.5">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{b.label}</span>
                    {b.range && <span className="ml-2 text-neutral-500">{b.range}</span>}
                    {peak && (
                      <span className="ml-2 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                        สูงสุด
                      </span>
                    )}
                  </td>
                  {platforms.map((p) => (
                    <td key={p} className={`${td} text-neutral-600 dark:text-neutral-400`}>
                      {baht(b.totals[p] ?? 0)}
                    </td>
                  ))}
                  <td className={`${td} font-semibold text-neutral-900 dark:text-neutral-100`}>{baht(b.total)}</td>
                  {showOrders && <td className={td}>{b.orders.toLocaleString("th-TH")}</td>}
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div className="h-full rounded-full bg-neutral-900 dark:bg-neutral-300" style={{ width: `${share}%` }} />
                      </div>
                      <span className="w-10 text-right tabular-nums text-neutral-500">{Math.round(share)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-neutral-200 font-semibold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
            <tr>
              <td className="px-5 py-2.5">{totalLabel}</td>
              {platforms.map((p) => (
                <td key={p} className={td}>
                  {baht(buckets.reduce((sum, b) => sum + (b.totals[p] ?? 0), 0))}
                </td>
              ))}
              <td className={td}>{baht(grand)}</td>
              {showOrders && <td className={td}>{orders.toLocaleString("th-TH")}</td>}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </SectionCard>
  );
}

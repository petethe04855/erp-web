"use client";

import React from "react";
import type { Platform } from "../types/dashboard";
import { PLATFORM_META } from "../lib/platforms";

interface PlatformSalesSummaryProps {
  platforms: Platform[];
  totals: Partial<Record<Platform, number>>;
  /** Platforms whose figure is still loading. */
  loading: Partial<Record<Platform, boolean>>;
  notes: Record<Platform, string>;
}

const money = (v: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(v);

/** Combined sales across the selected platforms, with each platform's share. */
export function PlatformSalesSummary({ platforms, totals, loading, notes }: PlatformSalesSummaryProps) {
  const anyLoading = platforms.some((p) => loading[p]);
  const grand = platforms.reduce((sum, p) => sum + (totals[p] ?? 0), 0);

  return (
    <section aria-label="ยอดขายตามแพลตฟอร์ม" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-neutral-950 bg-neutral-950 p-5 text-white">
        <p className="text-xs text-neutral-400">ยอดขายรวม {platforms.length === 3 ? "ทุกแพลตฟอร์ม" : `${platforms.length} แพลตฟอร์ม`}</p>
        <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
          {anyLoading ? <span className="inline-block h-8 w-32 animate-pulse rounded bg-neutral-800" /> : money(grand)}
        </p>
        <p className="mt-3 text-[11px] text-neutral-500">
          {platforms.map((p) => PLATFORM_META[p].label).join(" + ")}
        </p>
      </div>

      {platforms.map((p) => {
        const value = totals[p] ?? 0;
        const share = grand > 0 ? Math.round((value / grand) * 100) : 0;
        return (
          <div
            key={p}
            className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${PLATFORM_META[p].dot}`} />
                {PLATFORM_META[p].label}
              </span>
              {!loading[p] && !anyLoading && <span className="tabular-nums">{share}%</span>}
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums text-neutral-900 dark:text-neutral-100">
              {loading[p] ? <span className="inline-block h-7 w-28 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" /> : money(value)}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className={`h-full ${PLATFORM_META[p].dot}`} style={{ width: `${anyLoading ? 0 : share}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">{notes[p]}</p>
          </div>
        );
      })}
    </section>
  );
}

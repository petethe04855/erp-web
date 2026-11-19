"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useDashboard } from "../hooks/useDashboard";
import { useTikTokLatestSync } from "@/features/tiktok/hooks/useTikTok";
import { PlatformSalesCharts, AccountingChart } from "./DashboardCharts";
import { useShopeeDashboard } from "@/features/shopee/hooks/useShopeeDashboard";
import { ShopeeDashboardCards } from "@/features/shopee/components/ShopeeDashboardCards";
import { ShopeeMonthlyTrendChart } from "@/features/shopee/components/ShopeeMonthlyTrendChart";
import { ShopeeTopSKUTable } from "@/features/shopee/components/ShopeeTopSKUTable";
import { PlatformFilter } from "./PlatformFilter";
import { PlatformSalesSummary } from "./PlatformSalesSummary";
import type { Platform } from "../types/dashboard";
import { ALL_PLATFORMS } from "../types/dashboard";
import {
  channelTotals,
  filterDashboardData,
  platformsFromSearch,
  platformOfChannel,
  PLATFORM_META,
} from "../lib/platforms";

const money = (v: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(v);

function formatSyncTime(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatThaiMonth(ym: string): string {
  if (!ym) return "";
  const parts = ym.split("-");
  if (parts.length < 2) return ym;
  const monthNum = parseInt(parts[1], 10);
  const yearNum = parseInt(parts[0], 10) + 543;
  const thaiMonths = [
    "",
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${thaiMonths[monthNum] || parts[1]} ${yearNum}`;
}

const SHOPEE_PRESETS = [
  { id: "selected", label: "ตามเดือนที่เลือก" },
  { id: "3m", label: "3 เดือนล่าสุด" },
  { id: "6m", label: "6 เดือนล่าสุด" },
  { id: "ytd", label: "ปีนี้ (YTD)" },
] as const;

interface DashboardProps {
  /** Platforms selected on first load (the URL `?platform=` wins). */
  defaultPlatforms?: Platform[];
}

/**
 * Unified business dashboard: TikTok, Shopee and Manual sales on one page,
 * driven by one month picker and a platform filter.
 */
export function Dashboard({
  defaultPlatforms = ALL_PLATFORMS,
}: DashboardProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(defaultPlatforms);
  const show = (p: Platform) => platforms.includes(p);
  const showOrders = show("tiktok") || show("manual");

  // TikTok + Manual revenue and business-wide accounting (single month)
  const q = useDashboard();
  const { latestRun } = useTikTokLatestSync();
  const data = q.data;

  // Shopee analytics: follows the selected month unless a range preset is picked
  const shopee = useShopeeDashboard();
  const shopeeFollowsMonth =
    shopee.isSingleMonth && shopee.fromMonth === q.month;

  const setMonth = (ym: string) => {
    q.setMonth(ym);
    shopee.selectSingleMonth(ym);
  };
  const shiftMonth = (offset: number) => {
    const [y, m] = q.month.split("-").map((n) => parseInt(n, 10));
    const d = new Date(y, m - 1 + offset, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const resetToCurrent = () => setMonth(q.currentYM);
  const refreshAll = () => {
    void q.refetch();
    void shopee.refetch();
  };
  const isFetching = q.isFetching || shopee.loading;

  // Platform selection from the URL (?platform=tiktok,shopee or legacy ?tab=)
  useEffect(() => {
    const fromUrl = platformsFromSearch(window.location.search);
    if (fromUrl) setPlatforms(fromUrl);
  }, []);

  const changePlatforms = (next: Platform[]) => {
    setPlatforms(next);
    const url = new URL(window.location.href);
    url.searchParams.delete("tab");
    if (next.length === ALL_PLATFORMS.length)
      url.searchParams.delete("platform");
    else url.searchParams.set("platform", next.join(","));
    window.history.replaceState(null, "", url);
  };

  // Auto-dismiss notification: show for 5 seconds when updated, then hide
  const [showNotification, setShowNotification] = useState(false);
  const lastRunIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!latestRun) return;

    const sessionKey = `tiktok_sync_notified_${latestRun.id}`;
    const alreadyNotified = sessionStorage.getItem(sessionKey);

    if (lastRunIdRef.current !== latestRun.id && !alreadyNotified) {
      lastRunIdRef.current = latestRun.id;
      sessionStorage.setItem(sessionKey, "1");
      setShowNotification(true);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [latestRun]);

  const orderTotals = channelTotals(data);
  const shopeeRange = shopee.isSingleMonth
    ? formatThaiMonth(shopee.fromMonth)
    : `${formatThaiMonth(shopee.fromMonth)} – ${formatThaiMonth(shopee.toMonth)}`;
  const filtered = data ? filterDashboardData(data, platforms) : undefined;
  const shopeeCoversMonth =
    !shopee.data || (shopee.fromMonth <= q.month && q.month <= shopee.toMonth);
  const shopeeDaily = shopeeCoversMonth ? (shopee.data?.daily_sales ?? []) : [];
  // An erp-api older than the daily_sales field returns no daily series even
  // though the Shopee totals are there; say so instead of drawing an empty line.
  const shopeeDailyMissing =
    !!shopee.data && shopee.data.ytd_summary.gross_sale > 0 && !shopee.data.daily_sales;

  return (
    <PageContainer>
      <PageHeader
        title="ภาพรวมธุรกิจและการเงิน"
        description="สรุปผลการดำเนินงานของ TikTok Shop, Shopee และการขายตรง (Manual) ในหน้าเดียว เลือกเดือนและแพลตฟอร์มที่ต้องการดูได้"
        actions={
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
              onClick={() => shiftMonth(-1)}
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              aria-label="เลือกเดือน"
              type="month"
              value={q.month}
              onChange={(e) => {
                if (e.target.value) setMonth(e.target.value);
              }}
              className="h-7 w-32 border-none p-0 text-xs font-semibold text-center focus-visible:ring-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
              onClick={() => shiftMonth(1)}
              title="เดือนถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!q.isCurrentMonth && (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-[11px] font-medium"
                onClick={resetToCurrent}
              >
                กลับสู่เดือนปัจจุบัน
              </Button>
            )}
            <Button
              aria-label="รีเฟรชข้อมูล"
              variant="outline"
              size="icon"
              className="h-7 w-7 ml-1"
              disabled={isFetching}
              onClick={refreshAll}
            >
              <RefreshCw
                size={13}
                className={isFetching ? "animate-spin" : ""}
              />
            </Button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <PlatformFilter value={platforms} onChange={changePlatforms} />
        <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {q.isCurrentMonth
            ? `เดือนปัจจุบัน: ${formatThaiMonth(q.month)}`
            : `ดูย้อนหลัง: ${formatThaiMonth(q.month)}`}
        </span>
      </div>

      {!q.isCurrentMonth && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-50/80 border border-amber-200 px-4 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>
              กำลังแสดงข้อมูลย้อนหลังของเดือน{" "}
              <strong>{formatThaiMonth(q.month)}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={resetToCurrent}
            className="text-amber-800 underline font-semibold hover:text-amber-950 dark:text-amber-200 cursor-pointer"
          >
            ดูข้อมูลเดือนปัจจุบัน &rarr;
          </button>
        </div>
      )}

      {/* TikTok Sync Status Banner */}
      {show("tiktok") && showNotification && latestRun && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2.5 text-xs text-emerald-900 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>
              <strong>TikTok Shop:</strong> ซิงค์ข้อมูลล่าสุดเมื่อ{" "}
              {formatSyncTime(latestRun.finishedAt || latestRun.startedAt)} น.
              (อัตโนมัติ)
              {latestRun.synced > 0 &&
                ` · พบคำสั่งซื้อใหม่ ${latestRun.synced} รายการ`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tiktok-orders"
              className="font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
            >
              ดูคำสั่งซื้อ TikTok &rarr;
            </Link>
            <button
              type="button"
              aria-label="ปิดการแจ้งเตือน"
              onClick={() => setShowNotification(false)}
              className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100/60"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* 1. Sales by platform */}
        <PlatformSalesSummary
          platforms={platforms}
          totals={{
            tiktok: orderTotals.tiktok,
            manual: orderTotals.manual,
            shopee: shopee.data?.ytd_summary.gross_sale ?? 0,
          }}
          loading={{
            tiktok: q.isPending,
            manual: q.isPending,
            shopee: shopee.loading && !shopee.data,
          }}
          notes={{
            tiktok: "สถานะจัดส่ง/สำเร็จ",
            manual: "Invoice ที่ชำระแล้ว",
            shopee: `ยอดขายรวม (Gross) · ${shopeeRange}`,
          }}
        />

        {/* 2. Sales charts by platform */}
        <PlatformSalesCharts
          month={q.month}
          platforms={platforms}
          data={data}
          shopeeDaily={shopeeDaily}
          shopeeNotice={
            !show("shopee")
              ? undefined
              : !shopeeCoversMonth
                ? `ช่วงข้อมูล Shopee (${shopeeRange}) ไม่ครอบคลุมเดือน ${formatThaiMonth(q.month)} — กด "ตามเดือนที่เลือก" ในส่วน Shopee เพื่อแสดงในกราฟ`
                : shopeeDailyMissing
                  ? "เซิร์ฟเวอร์ยังไม่ส่งยอด Shopee รายวัน (erp-api ต้องอัปเดต/รีสตาร์ท) — ยอดรวม Shopee ยังดูได้ที่การ์ดด้านบน"
                  : undefined
          }
        />

        {/* 3. Business-wide accounting */}
        <section aria-labelledby="business-overview">
          <h2
            id="business-overview"
            className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
          >
            ภาพรวมธุรกิจจากบัญชี{" "}
            <span className="font-normal text-neutral-500">
              · ทุกช่องทาง · {formatThaiMonth(q.month)}
            </span>
          </h2>
          {q.isPending ? (
            <Loading message="กำลังโหลดรายงาน ERP…" />
          ) : q.isError ? (
            <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
          ) : (
            data && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: "กำไรขั้นต้น",
                      value: money(data.financial.grossProfit),
                      note: "รายได้ − ต้นทุนขาย",
                      href: "/finance/reports",
                    },
                    {
                      label: "กำไรสุทธิ",
                      value: money(data.financial.netProfit),
                      note: "หลังหักค่าใช้จ่ายดำเนินงาน",
                      href: "/finance/reports",
                    },
                    {
                      label: "มูลค่าสินค้าคงคลัง",
                      value: money(data.inventory.totalValue),
                      note:
                        "ยอดปัจจุบัน · " +
                        data.inventory.totalQty.toLocaleString("th-TH") +
                        " หน่วย",
                      href: "/inventory",
                    },
                  ].map((item) => (
                    <Link
                      href={item.href}
                      key={item.label}
                      className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-500">{item.label}</p>
                        <ArrowUpRight size={15} />
                      </div>
                      <p className="text-2xl font-semibold tracking-tight tabular-nums mt-4">
                        {item.value}
                      </p>
                      <p className="text-[11px] mt-2 text-neutral-500">
                        {item.note}
                      </p>
                    </Link>
                  ))}
                </div>
                <AccountingChart data={data} />
              </div>
            )
          )}
        </section>

        {/* 4. TikTok & others: recent sales */}
        {showOrders && filtered && (
          <section aria-labelledby="orders-section" className="space-y-5">
            <h2
              id="orders-section"
              className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
            >
              {[
                show("tiktok") && PLATFORM_META.tiktok.label,
                show("manual") && PLATFORM_META.manual.label,
              ]
                .filter(Boolean)
                .join(" & ")}
              <span className="font-normal text-neutral-500">
                {" "}
                · {formatThaiMonth(q.month)}
              </span>
            </h2>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                  รายการขายในเดือน {formatThaiMonth(q.month)}
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  {show("manual") && (
                    <Link
                      href="/orders"
                      className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 underline"
                    >
                      ดูรายการอื่นๆ (Manual)
                    </Link>
                  )}
                  {show("tiktok") && (
                    <Link
                      href="/tiktok-orders"
                      className="text-cyan-600 hover:text-cyan-700 underline font-medium"
                    >
                      ดู TikTok
                    </Link>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-500">
                    <tr>
                      {["วันที่", "เอกสาร", "ลูกค้า", "ช่องทาง", "ยอดขาย"].map(
                        (h) => (
                          <th
                            className="text-left px-5 py-3 font-medium"
                            key={h}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filtered.revenue.rows.slice(0, 8).map((r) => {
                      const p = platformOfChannel(r.channel);
                      return (
                        <tr
                          key={r.reference}
                          className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                        >
                          <td className="px-5 py-3.5 text-xs text-neutral-600 dark:text-neutral-400">
                            {r.date}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                            {r.reference}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-neutral-700 dark:text-neutral-300">
                            {r.customer}
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p === "tiktok"
                                  ? "bg-cyan-50 text-cyan-700 border border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300"
                                  : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                              }`}
                            >
                              {p === "tiktok" ? "TikTok" : "อื่นๆ"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {money(r.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.revenue.rows.length === 0 && (
                  <p className="p-8 text-center text-sm text-neutral-500">
                    ไม่มีรายการในช่วงเวลานี้
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 5. Shopee */}
        {show("shopee") && (
          <section aria-labelledby="shopee-section" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                id="shopee-section"
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
              >
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                {PLATFORM_META.shopee.label} · รายรับ & กำไรสุทธิ
                <span className="font-normal text-neutral-500">
                  · {shopeeRange}
                </span>
              </h2>
              <div className="flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-neutral-50 p-1 text-xs dark:border-neutral-800 dark:bg-neutral-800/50">
                <span className="flex items-center gap-1 px-2 text-[11px] font-medium text-neutral-400">
                  <Clock className="h-3 w-3" /> ช่วงข้อมูล:
                </span>
                {SHOPEE_PRESETS.map((p) => {
                  const active =
                    p.id === "selected"
                      ? shopeeFollowsMonth
                      : !shopeeFollowsMonth && shopee.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        p.id === "selected"
                          ? shopee.selectSingleMonth(q.month)
                          : shopee.applyPreset(p.id)
                      }
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        active
                          ? "bg-orange-500 text-white shadow-xs font-semibold"
                          : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {shopee.error && (
              <ErrorState message={shopee.error} onRetry={shopee.refetch} />
            )}
            <ShopeeDashboardCards
              summary={shopee.data?.ytd_summary}
              loading={shopee.loading}
            />
            <ShopeeMonthlyTrendChart
              trends={shopee.data?.monthly_trends || []}
              loading={shopee.loading}
            />
            <ShopeeTopSKUTable
              topSkus={shopee.data?.top_skus || []}
              loading={shopee.loading}
            />
          </section>
        )}

        {data && (
          <p className="text-xs text-neutral-400">
            อัปเดต {new Date(q.dataUpdatedAt).toLocaleTimeString("th-TH")} ·
            รีเฟรชอัตโนมัติทุก 60 วินาที
          </p>
        )}
      </div>
    </PageContainer>
  );
}

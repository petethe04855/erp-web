"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  CheckCircle2,
  X,
  ShoppingBag,
  Clock,
  Receipt,
  Users,
  Target,
  Trophy,
  Repeat,
  UserRound,
  Crown,
  TrendingUp,
  Wallet,
  Boxes,
  ReceiptText,
  Info,
} from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useDashboard, type PeriodMode } from "../hooks/useDashboard";
import { useTikTokLatestSync } from "@/features/tiktok/hooks/useTikTok";
import { PlatformSalesCharts, AccountingChart } from "./DashboardCharts";
import { useShopeeDashboard } from "@/features/shopee/hooks/useShopeeDashboard";
import { ShopeeDashboardCards } from "@/features/shopee/components/ShopeeDashboardCards";
import { ShopeeMonthlyTrendChart } from "@/features/shopee/components/ShopeeMonthlyTrendChart";
import { ShopeeTopSKUTable } from "@/features/shopee/components/ShopeeTopSKUTable";
import { PlatformSalesSummary } from "./PlatformSalesSummary";
import { DashboardFilterBar } from "./DashboardFilterBar";
import { DashboardTabs, panelId, tabId, viewFromSearch, type DashboardView } from "./DashboardTabs";
import { KpiCard } from "./KpiCard";
import { SectionCard } from "./SectionCard";
import { SalesBreakdownTable } from "./SalesBreakdownTable";
import { TopCustomersChart, CustomerRankingTable } from "./TopCustomers";
import type { Platform } from "../types/dashboard";
import { ALL_PLATFORMS } from "../types/dashboard";
import {
  buildDailySeries,
  channelTotals,
  filterDashboardData,
  platformsFromSearch,
  platformOfChannel,
  PLATFORM_META,
} from "../lib/platforms";
import {
  formatThaiMonth,
  monthlyBuckets,
  monthsOfYear,
  peakBucket,
  rankCustomers,
  summarizeOrders,
  weeklyBuckets,
} from "../lib/metrics";

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

const SHOPEE_PRESETS = [
  { id: "selected", label: "ตามช่วงที่เลือก" },
  { id: "3m", label: "3 เดือนล่าสุด" },
  { id: "6m", label: "6 เดือนล่าสุด" },
  { id: "ytd", label: "ปีนี้ (YTD)" },
] as const;

const kpiGrid = "grid gap-4 sm:grid-cols-2 xl:grid-cols-4";

function TabHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
    </div>
  );
}

interface DashboardProps {
  /** Platforms selected on first load (the URL `?platform=` wins). */
  defaultPlatforms?: Platform[];
}

/**
 * Unified business dashboard: TikTok, Shopee and Manual sales on one page,
 * driven by one month picker and a platform filter, split into three tabs
 * (sales & trends, customers, products/profit/accounting).
 */
export function Dashboard({
  defaultPlatforms = ALL_PLATFORMS,
}: DashboardProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(defaultPlatforms);
  const [view, setView] = useState<DashboardView>("sales");
  const show = (p: Platform) => platforms.includes(p);
  const showOrders = show("tiktok") || show("manual");

  // TikTok + Manual revenue and business-wide accounting (single month)
  const q = useDashboard();
  const { latestRun } = useTikTokLatestSync();
  const data = q.data;

  // Shopee analytics: follows the selected period unless a range preset is picked
  const shopee = useShopeeDashboard();
  const shopeeFollowsPeriod =
    shopee.fromMonth === q.from && shopee.toMonth === q.to;
  const followShopee = (from: string, to: string) => {
    if (from === to) shopee.selectSingleMonth(from);
    else {
      shopee.setFromMonth(from);
      shopee.setToMonth(to);
    }
  };

  // Period: one month, or a whole year (up to the current month)
  const applyPeriod = (mode: PeriodMode, month: string, year: number) => {
    q.setMode(mode);
    q.setMonth(month);
    q.setYear(year);
    const months = mode === "month" ? [month] : monthsOfYear(year, q.currentYM);
    if (months.length) followShopee(months[0], months[months.length - 1]);
  };
  const setMonth = (ym: string) => applyPeriod("month", ym, parseInt(ym.slice(0, 4), 10));
  const setYear = (y: number) => applyPeriod("year", q.month, Math.min(y, q.currentYear));
  const changeMode = (mode: PeriodMode) => {
    if (mode === q.mode) return;
    if (mode === "year") setYear(parseInt(q.month.slice(0, 4), 10));
    else setMonth(q.year === q.currentYear ? q.currentYM : `${q.year}-12`);
  };
  const shiftPeriod = (offset: number) => {
    if (q.mode === "year") return setYear(q.year + offset);
    const [y, m] = q.month.split("-").map((n) => parseInt(n, 10));
    const d = new Date(y, m - 1 + offset, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const resetToCurrent = () => applyPeriod(q.mode, q.currentYM, q.currentYear);
  const refreshAll = () => {
    void q.refetch();
    void shopee.refetch();
  };
  const isFetching = q.isFetching || shopee.loading;

  // Platform and tab selection from the URL (?platform=tiktok,shopee&view=customers, or legacy ?tab=)
  useEffect(() => {
    const fromUrl = platformsFromSearch(window.location.search);
    if (fromUrl) setPlatforms(fromUrl);
    const v = viewFromSearch(window.location.search);
    if (v) setView(v);
  }, []);

  const updateUrl = (edit: (params: URLSearchParams) => void) => {
    const url = new URL(window.location.href);
    edit(url.searchParams);
    window.history.replaceState(null, "", url);
  };

  const changePlatforms = (next: Platform[]) => {
    setPlatforms(next);
    updateUrl((params) => {
      params.delete("tab");
      if (next.length === ALL_PLATFORMS.length) params.delete("platform");
      else params.set("platform", next.join(","));
    });
  };

  const changeView = (next: DashboardView) => {
    setView(next);
    updateUrl((params) => {
      if (next === "sales") params.delete("view");
      else params.set("view", next);
    });
  };

  const isDefaultFilter =
    platforms.length === ALL_PLATFORMS.length &&
    q.mode === "month" &&
    q.isCurrentMonth &&
    shopeeFollowsPeriod;
  const resetFilters = () => {
    changePlatforms([...ALL_PLATFORMS]);
    applyPeriod("month", q.currentYM, q.currentYear);
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

  const yearly = q.mode === "year";
  const periodLabel = q.label;
  const periodWord = yearly ? "ปี" : "เดือน";
  const orderTotals = channelTotals(data);
  const shopeeRange = shopee.isSingleMonth
    ? formatThaiMonth(shopee.fromMonth)
    : `${formatThaiMonth(shopee.fromMonth)} – ${formatThaiMonth(shopee.toMonth)}`;
  const filtered = data ? filterDashboardData(data, platforms) : undefined;
  const shopeeCoversPeriod =
    !shopee.data || (shopee.fromMonth <= q.from && q.to <= shopee.toMonth);
  const shopeeDaily = shopeeCoversPeriod ? (shopee.data?.daily_sales ?? []) : [];
  const shopeeMonthly = shopeeCoversPeriod ? (shopee.data?.monthly_trends ?? []) : [];
  // An erp-api older than the daily_sales field returns no daily series even
  // though the Shopee totals are there; say so instead of drawing an empty line.
  const shopeeDailyMissing =
    !!shopee.data && shopee.data.ytd_summary.gross_sale > 0 && !shopee.data.daily_sales;

  // Headline figures across the selected platforms
  const salesTotals: Record<Platform, number> = {
    tiktok: orderTotals.tiktok,
    manual: orderTotals.manual,
    shopee: shopee.data?.ytd_summary.gross_sale ?? 0,
  };
  const salesLoading: Record<Platform, boolean> = {
    tiktok: q.isPending,
    manual: q.isPending,
    shopee: shopee.loading && !shopee.data,
  };
  const kpiLoading = platforms.some((p) => salesLoading[p]);
  const orderRows = filtered?.revenue.rows ?? [];
  const orderSummary = summarizeOrders(orderRows);
  const shopeeOrders = show("shopee") ? (shopee.data?.ytd_summary.order_count ?? 0) : 0;
  const totalRevenue = platforms.reduce((sum, p) => sum + salesTotals[p], 0);
  const totalOrders = orderSummary.orders + shopeeOrders;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Breakdown of the period: weeks of the month, or months of the year
  const daily = buildDailySeries(q.month, platforms, filtered, shopeeDaily);
  const buckets = yearly
    ? monthlyBuckets(q.months, platforms, orderRows, shopeeMonthly)
    : weeklyBuckets(daily.labels, daily.series, platforms, orderRows);
  const peak = peakBucket(buckets);
  const latestRows = [...(filtered?.revenue.rows ?? [])]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 8);

  // Customers (revenue-report rows only: Shopee has no per-customer data)
  const customers = rankCustomers(orderRows);
  const namedRevenue = customers.reduce((sum, c) => sum + c.amount, 0);
  const repeatCustomers = customers.filter((c) => c.orders > 1).length;
  const top10Share = customers.slice(0, 10).reduce((sum, c) => sum + c.share, 0);
  const pct = (n: number, of: number) => (of > 0 ? Math.round((n / of) * 100) : 0);

  const panel = (v: DashboardView) => ({
    id: panelId(v),
    role: "tabpanel" as const,
    "aria-labelledby": tabId(v),
    hidden: view !== v,
    className: "space-y-6",
  });

  return (
    <PageContainer>
      <PageHeader
        title="ภาพรวมธุรกิจและการเงิน"
        description="สรุปผลการดำเนินงานของ TikTok Shop, Shopee และการขายตรง (Manual) ในหน้าเดียว เลือกเดือนและแพลตฟอร์มที่ต้องการดูได้"
        actions={
          <div className="flex items-center gap-2">
            {data && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                อัปเดต {new Date(q.dataUpdatedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
              </span>
            )}
            <Button
              aria-label="รีเฟรชข้อมูล"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              disabled={isFetching}
              onClick={refreshAll}
            >
              <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
              รีเฟรช
            </Button>
          </div>
        }
      />

      <DashboardTabs value={view} onChange={changeView} />

      <DashboardFilterBar
        mode={q.mode}
        onModeChange={changeMode}
        month={q.month}
        onMonthChange={setMonth}
        year={q.year}
        currentYear={q.currentYear}
        onYearChange={setYear}
        onShift={shiftPeriod}
        isCurrentPeriod={q.isCurrentPeriod}
        onCurrentPeriod={resetToCurrent}
        platforms={platforms}
        onPlatformsChange={changePlatforms}
        stats={{
          orders: totalOrders,
          revenue: totalRevenue,
          customers: orderSummary.customers,
          loading: kpiLoading,
        }}
        onReset={isDefaultFilter ? undefined : resetFilters}
      />

      {!q.isCurrentPeriod && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-50/80 border border-amber-200 px-4 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>
              กำลังแสดงข้อมูลย้อนหลังของ{yearly ? "" : "เดือน"}{" "}
              <strong>{periodLabel}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={resetToCurrent}
            className="text-amber-800 underline font-semibold hover:text-amber-950 dark:text-amber-200 cursor-pointer"
          >
            ดูข้อมูล{periodWord}ปัจจุบัน &rarr;
          </button>
        </div>
      )}

      {yearly && (
        <p className="mb-4 flex items-center gap-2 text-xs text-neutral-500">
          <Info className="h-3.5 w-3.5 shrink-0" />
          มุมมองรายปีรวมข้อมูล {q.months.length} เดือน ({formatThaiMonth(q.from)} – {formatThaiMonth(q.to)})
          {q.year === q.currentYear && " · ถึงเดือนปัจจุบัน"}
        </p>
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

      {/* ==================== TAB 1: Sales & trends ==================== */}
      <div {...panel("sales")}>
        <TabHeading
          title={`ยอดขายและแนวโน้ม · ${periodLabel}`}
          description={`ยอดขายรวม จำนวนบิล ลูกค้า และแนวโน้ม${yearly ? "รายเดือน" : "รายวัน/รายสัปดาห์"}ของแพลตฟอร์มที่เลือก`}
        />

        <PlatformSalesSummary
          platforms={platforms}
          totals={salesTotals}
          loading={salesLoading}
          notes={{
            tiktok: "สถานะจัดส่ง/สำเร็จ",
            manual: "Invoice ที่ชำระแล้ว",
            shopee: `ยอดขายรวม (Gross) · ${shopeeRange}`,
          }}
        />

        <div className={kpiGrid}>
          <KpiCard
            label="คำสั่งซื้อ"
            icon={Receipt}
            loading={kpiLoading}
            value={`${totalOrders.toLocaleString("th-TH")} บิล`}
            sub={
              show("shopee") && showOrders
                ? `TikTok/Manual ${orderSummary.orders.toLocaleString("th-TH")} · Shopee ${shopeeOrders.toLocaleString("th-TH")}`
                : `จำนวนเอกสารขายใน${periodWord}ที่เลือก`
            }
          />
          <KpiCard
            label="ลูกค้าที่ซื้อจริง"
            icon={Users}
            loading={q.isPending}
            value={`${orderSummary.customers.toLocaleString("th-TH")} ราย`}
            sub={show("shopee") ? "ไม่รวม Shopee (ไม่มีข้อมูลรายลูกค้า)" : "นับจากชื่อลูกค้าในรายการขาย"}
          />
          <KpiCard
            label="ยอดเฉลี่ยต่อบิล (AOV)"
            icon={Target}
            loading={kpiLoading}
            value={money(aov)}
            sub="ยอดขายรวม ÷ จำนวนบิล"
          />
          <KpiCard
            label={yearly ? "เดือนยอดขายสูงสุด" : "สัปดาห์ยอดขายสูงสุด"}
            icon={Trophy}
            loading={kpiLoading}
            value={peak ? (yearly ? formatThaiMonth(peak.from.slice(0, 7)) : peak.label) : "–"}
            sub={
              peak
                ? `${peak.range ? `${peak.range} · ` : ""}${money(peak.total)}${showOrders ? ` (${peak.orders} บิล)` : ""}`
                : `ยังไม่มียอดขายใน${periodWord}นี้`
            }
          />
        </div>

        <PlatformSalesCharts
          month={q.month}
          platforms={platforms}
          data={data}
          shopeeDaily={shopeeDaily}
          monthly={yearly ? buckets : undefined}
          shopeeNotice={
            !show("shopee")
              ? undefined
              : !shopeeCoversPeriod
                ? `ช่วงข้อมูล Shopee (${shopeeRange}) ไม่ครอบคลุม ${periodLabel} — กด "ตามช่วงที่เลือก" ในแท็บสินค้า กำไร และบัญชี เพื่อแสดงในกราฟ`
                : !yearly && shopeeDailyMissing
                  ? "เซิร์ฟเวอร์ยังไม่ส่งยอด Shopee รายวัน (erp-api ต้องอัปเดต/รีสตาร์ท) — ยอดรวม Shopee ยังดูได้ที่การ์ดด้านบน"
                  : undefined
          }
        />

        <SalesBreakdownTable
          title={yearly ? "ตารางยอดขายรายเดือน" : "ตารางยอดขายรายสัปดาห์"}
          description={
            yearly
              ? `แยกตามเดือนของ${periodLabel} · Shopee ตามเดือนที่โอนเงิน`
              : "แบ่งเป็นสัปดาห์ของเดือน (วันที่ 1–7, 8–14, 15–21, 22–28, 29–สิ้นเดือน)"
          }
          unit={yearly ? "เดือน" : "สัปดาห์"}
          totalLabel={yearly ? "รวมทั้งปี" : "รวมทั้งเดือน"}
          buckets={buckets}
          platforms={platforms}
          peakKey={peak?.key ?? null}
          showOrders={showOrders}
        />

        {showOrders && filtered && (
          <SectionCard
            flush
            icon={ReceiptText}
            title={`รายการขายล่าสุด · ${[
              show("tiktok") && PLATFORM_META.tiktok.label,
              show("manual") && PLATFORM_META.manual.label,
            ]
              .filter(Boolean)
              .join(" & ")}`}
            description={`8 รายการล่าสุดของ${yearly ? "" : "เดือน "}${periodLabel}`}
            actions={
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
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-500">
                  <tr>
                    {["วันที่", "เอกสาร", "ลูกค้า", "ช่องทาง", "ยอดขาย"].map((h) => (
                      <th className="text-left px-5 py-3 font-medium" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {latestRows.map((r) => {
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
          </SectionCard>
        )}
      </div>

      {/* ==================== TAB 2: Customers ==================== */}
      <div {...panel("customers")}>
        <TabHeading
          title={`พฤติกรรมลูกค้า · ${periodLabel}`}
          description="อันดับลูกค้าและการซื้อซ้ำ จากรายการขาย TikTok และ Manual (Shopee ไม่มีข้อมูลรายลูกค้า)"
        />

        {!showOrders ? (
          <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
            <p>
              ข้อมูลรายลูกค้ามีเฉพาะ {PLATFORM_META.tiktok.label} และ {PLATFORM_META.manual.label} —
              เลือกแพลตฟอร์มเหล่านี้ในตัวกรองด้านบนเพื่อดูอันดับลูกค้า
            </p>
          </div>
        ) : q.isError ? (
          <ErrorState message={q.error?.message ?? ""} onRetry={() => q.refetch()} />
        ) : (
          <>
            <div className={kpiGrid}>
              <KpiCard
                label="ลูกค้าที่ระบุชื่อ"
                icon={UserRound}
                loading={q.isPending}
                value={`${customers.length.toLocaleString("th-TH")} ราย`}
                sub={`มีรายการซื้อใน${periodWord}ที่เลือก`}
              />
              <KpiCard
                label="ลูกค้าที่ซื้อซ้ำในเดือน"
                icon={Repeat}
                loading={q.isPending}
                value={`${repeatCustomers.toLocaleString("th-TH")} ราย`}
                sub={`${pct(repeatCustomers, customers.length)}% ของลูกค้า · ซื้อมากกว่า 1 บิล`}
              />
              <KpiCard
                label="ยอดซื้อเฉลี่ยต่อลูกค้า"
                icon={Wallet}
                loading={q.isPending}
                value={money(customers.length ? namedRevenue / customers.length : 0)}
                sub="ยอดซื้อรวม ÷ จำนวนลูกค้า"
              />
              <KpiCard
                label="ยอดจากลูกค้า Top 10"
                icon={Crown}
                loading={q.isPending}
                value={`${top10Share.toFixed(1)}%`}
                sub={`ของยอดซื้อลูกค้าทั้งหมด ${money(namedRevenue)}`}
              />
            </div>
            <TopCustomersChart customers={customers} />
            <CustomerRankingTable customers={customers} />
          </>
        )}
      </div>

      {/* ==================== TAB 3: Products, profit & accounting ==================== */}
      <div {...panel("profit")}>
        <TabHeading
          title="สินค้า กำไร และบัญชี"
          description="รายรับและกำไรสุทธิของ Shopee, สินค้าทำกำไรสูงสุด และภาพรวมจากบัญชีทุกช่องทาง"
        />

        {show("shopee") && (
          <section aria-labelledby="shopee-section" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3
                id="shopee-section"
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
              >
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                {PLATFORM_META.shopee.label} · รายรับ & กำไรสุทธิ
                <span className="font-normal text-neutral-500">· {shopeeRange}</span>
              </h3>
              <div className="flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-neutral-50 p-1 text-xs dark:border-neutral-800 dark:bg-neutral-800/50">
                <span className="flex items-center gap-1 px-2 text-[11px] font-medium text-neutral-400">
                  <Clock className="h-3 w-3" /> ช่วงข้อมูล:
                </span>
                {SHOPEE_PRESETS.map((p) => {
                  const active =
                    p.id === "selected"
                      ? shopeeFollowsPeriod
                      : !shopeeFollowsPeriod && shopee.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        p.id === "selected"
                          ? followShopee(q.from, q.to)
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

        <section aria-labelledby="business-overview" className="space-y-5">
          <h3
            id="business-overview"
            className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
          >
            ภาพรวมธุรกิจจากบัญชี{" "}
            <span className="font-normal text-neutral-500">
              · ทุกช่องทาง · {periodLabel}
            </span>
          </h3>
          {q.isPending ? (
            <Loading message="กำลังโหลดรายงาน ERP…" />
          ) : q.isError ? (
            <ErrorState message={q.error?.message ?? ""} onRetry={() => q.refetch()} />
          ) : (
            data && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <KpiCard
                    label="กำไรขั้นต้น"
                    icon={TrendingUp}
                    href="/finance/reports"
                    value={money(data.financial.grossProfit)}
                    sub="รายได้ − ต้นทุนขาย"
                  />
                  <KpiCard
                    label="กำไรสุทธิ"
                    icon={Wallet}
                    href="/finance/reports"
                    value={money(data.financial.netProfit)}
                    sub="หลังหักค่าใช้จ่ายดำเนินงาน"
                  />
                  <KpiCard
                    label="มูลค่าสินค้าคงคลัง"
                    icon={Boxes}
                    href="/inventory"
                    value={money(data.inventory.totalValue)}
                    sub={`ยอดปัจจุบัน · ${data.inventory.totalQty.toLocaleString("th-TH")} หน่วย`}
                  />
                </div>
                <AccountingChart data={data} />
              </>
            )
          )}
        </section>
      </div>

      {data && (
        <p className="mt-8 text-xs text-neutral-400">
          อัปเดต {new Date(q.dataUpdatedAt).toLocaleTimeString("th-TH")} ·
          รีเฟรชอัตโนมัติทุก 60 วินาที
        </p>
      )}
    </PageContainer>
  );
}

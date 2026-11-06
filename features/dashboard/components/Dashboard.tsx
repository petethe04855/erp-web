"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  X,
  Calendar,
  Store,
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
import { DashboardCharts } from "./DashboardCharts";
import {
  useShopeeDashboard,
  ShopeeDashboardPreset,
} from "@/features/shopee/hooks/useShopeeDashboard";
import { ShopeeDashboardCards } from "@/features/shopee/components/ShopeeDashboardCards";
import { ShopeeMonthlyTrendChart } from "@/features/shopee/components/ShopeeMonthlyTrendChart";
import { ShopeeTopSKUTable } from "@/features/shopee/components/ShopeeTopSKUTable";

function normalizeChannelName(raw: string): string {
  const upper = (raw || "").toUpperCase().trim();
  if (upper.includes("TIKTOK") || upper.includes("TIK TOK")) return "TikTok";
  if (upper.includes("MANUAL") || upper === "DIRECT" || !upper) return "Manual";
  return raw.trim();
}

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

interface DashboardProps {
  defaultTab?: "tiktok" | "shopee";
}

export function Dashboard({ defaultTab = "tiktok" }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"tiktok" | "shopee">(defaultTab);

  // TikTok / General Dashboard Query
  const q = useDashboard();
  const { latestRun } = useTikTokLatestSync();
  const data = q.data;

  // Shopee Dashboard Query (Defaults to Current Month)
  const shopee = useShopeeDashboard();

  // URL Query parameter check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "shopee" || tabParam === "tiktok") {
        setActiveTab(tabParam);
      }
    }
  }, []);

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

  return (
    <PageContainer>
      <PageHeader
        title="ภาพรวมธุรกิจและการเงิน"
        description="แสดงข้อมูลสรุปผลการดำเนินงานปัจจุบัน พร้อมตัวเลือกดูย้อนหลังแต่ละเดือนของทุกแพลตฟอร์ม"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "tiktok" ? (
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
                  onClick={() => q.shiftMonth(-1)}
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Input
                  aria-label="เลือกเดือน"
                  type="month"
                  value={q.month}
                  onChange={(e) => {
                    if (e.target.value) q.setMonth(e.target.value);
                  }}
                  className="h-7 w-32 border-none p-0 text-xs font-semibold text-center focus-visible:ring-0"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
                  onClick={() => q.shiftMonth(1)}
                  title="เดือนถัดไป"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {!q.isCurrentMonth && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2 text-[11px] font-medium"
                    onClick={q.resetToCurrent}
                  >
                    กลับสู่เดือนปัจจุบัน
                  </Button>
                )}

                <Button
                  aria-label="รีเฟรชข้อมูล"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 ml-1"
                  disabled={q.isFetching}
                  onClick={() => q.refetch()}
                >
                  <RefreshCw size={13} className={q.isFetching ? "animate-spin" : ""} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-xs">
                {/* Single Month Stepper */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
                  onClick={() => shopee.shiftMonth(-1)}
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 text-xs">
                  <Input
                    type="month"
                    value={shopee.fromMonth}
                    onChange={(e) => shopee.setFromMonth(e.target.value)}
                    className="h-7 w-28 border-none p-0 text-xs font-semibold text-center focus-visible:ring-0"
                  />
                  {!shopee.isSingleMonth && (
                    <>
                      <span className="text-neutral-400">ถึง</span>
                      <Input
                        type="month"
                        value={shopee.toMonth}
                        onChange={(e) => shopee.setToMonth(e.target.value)}
                        className="h-7 w-28 border-none p-0 text-xs font-semibold text-center focus-visible:ring-0"
                      />
                    </>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-500 hover:text-neutral-900"
                  onClick={() => shopee.shiftMonth(1)}
                  title="เดือนถัดไป"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {!shopee.isCurrentMonth && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2 text-[11px] font-medium"
                    onClick={() => shopee.applyPreset("current")}
                  >
                    กลับสู่เดือนปัจจุบัน
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 ml-1"
                  onClick={shopee.refetch}
                  disabled={shopee.loading}
                  title="รีเฟรชข้อมูล"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${shopee.loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            )}
          </div>
        }
      />

      {/* Platform Tab Switcher & Historical Range Presets */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 rounded-xl bg-neutral-100/90 p-1.5 dark:bg-neutral-800/80 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("tiktok")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "tiktok"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-100"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-cyan-500/20" />
            <Store className="h-3.5 w-3.5" />
            <span>TikTok Shop & ภาพรวมธุรกิจ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shopee")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "shopee"
                ? "bg-white text-orange-600 shadow-xs dark:bg-neutral-900 dark:text-orange-400"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-orange-500 ring-2 ring-orange-500/20" />
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Shopee Dashboard (รายรับ & กำไรสุทธิ)</span>
          </button>
        </div>

        {/* Quick Range / Historical Presets */}
        {activeTab === "shopee" ? (
          <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/50 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-xs">
            <span className="text-[11px] text-neutral-400 px-2 flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" /> ช่วงดูข้อมูล:
            </span>
            {(
              [
                { id: "current", label: "เดือนปัจจุบัน" },
                { id: "3m", label: "3 เดือนล่าสุด" },
                { id: "6m", label: "6 เดือนล่าสุด" },
                { id: "ytd", label: "ปีนี้ (YTD)" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => shopee.applyPreset(p.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  shopee.preset === p.id
                    ? "bg-orange-500 text-white shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md font-medium text-neutral-700 dark:text-neutral-300">
              {q.isCurrentMonth
                ? `📅 เดือนปัจจุบัน: ${formatThaiMonth(q.month)}`
                : `🕰️ ดูย้อนหลัง: ${formatThaiMonth(q.month)}`}
            </span>
          </div>
        )}
      </div>

      {/* Historical Context Notice (when not viewing current month) */}
      {activeTab === "tiktok" && !q.isCurrentMonth && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-50/80 border border-amber-200 px-4 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>
              กำลังแสดงข้อมูลย้อนหลังของเดือน <strong>{formatThaiMonth(q.month)}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={q.resetToCurrent}
            className="text-amber-800 underline font-semibold hover:text-amber-950 dark:text-amber-200 cursor-pointer"
          >
            ดูข้อมูลเดือนปัจจุบัน &rarr;
          </button>
        </div>
      )}

      {activeTab === "shopee" && !shopee.isCurrentMonth && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-orange-50/80 border border-orange-200 px-4 py-2 text-xs text-orange-900 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-300">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>
              กำลังแสดงข้อมูล Shopee ช่วงเวลา{" "}
              <strong>
                {formatThaiMonth(shopee.fromMonth)}
                {!shopee.isSingleMonth && ` ถึง ${formatThaiMonth(shopee.toMonth)}`}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => shopee.applyPreset("current")}
            className="text-orange-800 underline font-semibold hover:text-orange-950 dark:text-orange-200 cursor-pointer"
          >
            ดูข้อมูลเดือนปัจจุบัน &rarr;
          </button>
        </div>
      )}

      {/* TAB 1: TikTok & General Overview */}
      {activeTab === "tiktok" && (
        <>
          {q.isPending ? (
            <Loading message="กำลังโหลดรายงาน ERP…" />
          ) : q.isError ? (
            <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
          ) : (
            data && (
              <>
                {/* TikTok Sync Status Banner */}
                {showNotification && latestRun && (
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2.5 text-xs text-emerald-900 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>
                        <strong>TikTok Shop:</strong> ซิงค์ข้อมูลล่าสุดเมื่อ{" "}
                        {formatSyncTime(latestRun.finishedAt || latestRun.startedAt)} น. (อัตโนมัติ)
                        {latestRun.synced > 0 && ` · พบคำสั่งซื้อใหม่ ${latestRun.synced} รายการ`}
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

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
                  {[
                    {
                      label: "ยอดขายสำเร็จ/ชำระแล้ว",
                      value: money(data.revenue.total),
                      note: "TikTok (จัดส่ง/สำเร็จ) + Manual ชำระแล้ว",
                      href: "/orders",
                    },
                    {
                      label: "กำไรขั้นต้น",
                      value: money(data.financial.grossProfit),
                      note: `จากบัญชีในเดือน ${formatThaiMonth(q.month)}`,
                      href: "/finance/reports",
                    },
                    {
                      label: "กำไรสุทธิ",
                      value: money(data.financial.netProfit),
                      note: `จากบัญชีในเดือน ${formatThaiMonth(q.month)}`,
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
                  ].map((item, i) => (
                    <Link
                      href={item.href}
                      key={item.label}
                      className={
                        "rounded-xl border p-6 transition-all hover:shadow-md " +
                        (i === 0
                          ? "bg-neutral-950 text-white border-neutral-950"
                          : "bg-white border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <p
                          className={
                            "text-xs " +
                            (i === 0 ? "text-neutral-400" : "text-neutral-500")
                          }
                        >
                          {item.label}
                        </p>
                        <ArrowUpRight size={15} />
                      </div>
                      <p className="text-3xl font-semibold tracking-tight tabular-nums mt-5">
                        {item.value}
                      </p>
                      <p className="text-[11px] mt-3 text-neutral-500">
                        {item.note}
                      </p>
                    </Link>
                  ))}
                </div>

                <DashboardCharts data={data} />

                {/* Recent Sales */}
                <section className="mt-6 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
                  <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                    <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                      รายการขายในเดือน {formatThaiMonth(q.month)}
                    </h2>
                    <div className="flex items-center gap-3 text-xs">
                      <Link href="/orders" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 underline">
                        ดู Manual
                      </Link>
                      <Link href="/tiktok-orders" className="text-cyan-600 hover:text-cyan-700 underline font-medium">
                        ดู TikTok
                      </Link>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-500">
                        <tr>
                          {["วันที่", "เอกสาร", "ลูกค้า", "ช่องทาง", "ยอดขาย"].map(
                            (h) => (
                              <th className="text-left px-5 py-3 font-medium" key={h}>
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {data.revenue.rows.slice(0, 8).map((r) => (
                          <tr key={r.reference} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
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
                                  normalizeChannelName(r.channel) === "TikTok"
                                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300"
                                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                }`}
                              >
                                {normalizeChannelName(r.channel)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 tabular-nums text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                              {money(r.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.revenue.rows.length === 0 && (
                      <p className="p-8 text-center text-sm text-neutral-500">
                        ไม่มีรายการในช่วงเวลานี้
                      </p>
                    )}
                  </div>
                </section>

                <p className="text-xs text-neutral-400 mt-5">
                  อัปเดต {new Date(q.dataUpdatedAt).toLocaleTimeString("th-TH")} · รีเฟรชอัตโนมัติทุก 60 วินาที
                </p>
              </>
            )
          )}
        </>
      )}

      {/* TAB 2: Shopee Dashboard */}
      {activeTab === "shopee" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {shopee.error && (
            <ErrorState message={shopee.error} onRetry={shopee.refetch} />
          )}

          {/* Shopee KPI Summary Cards */}
          <ShopeeDashboardCards
            summary={shopee.data?.ytd_summary}
            loading={shopee.loading}
          />

          {/* Main Trends & Top SKUs */}
          <div className="space-y-6">
            <ShopeeMonthlyTrendChart
              trends={shopee.data?.monthly_trends || []}
              loading={shopee.loading}
            />
            <ShopeeTopSKUTable
              topSkus={shopee.data?.top_skus || []}
              loading={shopee.loading}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}

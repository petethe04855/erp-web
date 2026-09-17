"use client";
import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, ArrowUpRight, CheckCircle2, AlertCircle, X } from "lucide-react";
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

export function Dashboard() {
  const q = useDashboard();
  const { latestRun } = useTikTokLatestSync();
  const data = q.data;

  // Auto-dismiss notification: show for 5 seconds when updated, then hide
  const [showNotification, setShowNotification] = useState(false);
  const lastRunIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!latestRun) return;

    // Check if this is a newly observed sync run
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
        title="ภาพรวมธุรกิจ"
        description="ยอดขาย การเงิน และมูลค่าสินค้าคงคลัง จากข้อมูล ERP ชุดเดียวกับระบบเดิม"
        actions={
          <div className="flex gap-2">
            <Input
              aria-label="เดือนรายงาน"
              type="month"
              value={q.month}
              onChange={(e) => {
                if (e.target.value) q.setMonth(e.target.value);
              }}
            />
            <Button
              aria-label="รีเฟรชข้อมูล"
              variant="outline"
              disabled={q.isFetching}
              onClick={() => q.refetch()}
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        }
      />
      {q.isPending ? (
        <Loading message="กำลังโหลดรายงาน ERP…" />
      ) : q.isError ? (
        <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
      ) : (
        data && (
          <>
            {/* TikTok Sync Status Banner - Displays for 5 seconds when updated */}
            {showNotification && latestRun && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2.5 text-xs text-emerald-900 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2">
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
                  note: "จากบัญชีในเดือนที่เลือก",
                  href: "/reports",
                },
                {
                  label: "กำไรสุทธิ",
                  value: money(data.financial.netProfit),
                  note: "จากบัญชีในเดือนที่เลือก",
                  href: "/reports",
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
                    "rounded-xl border p-6 " +
                    (i === 0
                      ? "bg-neutral-950 text-white border-neutral-950"
                      : "bg-white border-neutral-200")
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
            <section className="mt-6 border rounded-xl bg-white overflow-hidden">
              <div className="p-5 border-b flex justify-between">
                <h2 className="font-semibold">รายการขายล่าสุดในเดือนนี้</h2>
                <div className="flex items-center gap-3 text-xs">
                  <Link href="/orders" className="underline">
                    ดู Manual
                  </Link>
                  <Link href="/tiktok-orders" className="underline">
                    ดู TikTok
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-xs text-neutral-500">
                    <tr>
                      {["วันที่", "เอกสาร", "ลูกค้า", "ช่องทาง", "ยอดขาย"].map(
                        (h) => (
                          <th className="text-left px-5 py-3" key={h}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenue.rows.slice(0, 8).map((r) => (
                      <tr key={r.reference} className="border-t">
                        <td className="px-5 py-4">{r.date}</td>
                        <td className="px-5 py-4 font-mono text-xs">
                          {r.reference}
                        </td>
                        <td className="px-5 py-4">{r.customer}</td>
                        <td className="px-5 py-4">{normalizeChannelName(r.channel)}</td>
                        <td className="px-5 py-4 tabular-nums">
                          {money(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.revenue.rows.length === 0 && (
                  <p className="p-8 text-sm text-neutral-500">
                    ไม่มีรายการในช่วงเวลานี้
                  </p>
                )}
              </div>
            </section>
            <p className="text-xs text-neutral-500 mt-5">
              อัปเดต {new Date(q.dataUpdatedAt).toLocaleTimeString("th-TH")} ·
              รีเฟรชอัตโนมัติทุก 60 วินาที
            </p>
          </>
        )
      )}
    </PageContainer>
  );
}

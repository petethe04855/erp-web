"use client";

import React, { useState } from "react";
import {
  usePnLReport,
  useGLReport,
  useTrialBalanceReport,
  useRevenueByChannelReport,
} from "@/features/finance/queries/useFinanceQueries";
import { financeApi } from "@/features/finance/api/financeApi";
import { ReportPnLView } from "@/features/finance/components/ReportPnLView";
import { ReportGLView } from "@/features/finance/components/ReportGLView";
import { ReportTrialBalanceView } from "@/features/finance/components/ReportTrialBalanceView";
import { Download, RefreshCw, BarChart2, BookOpen, Scale, PieChart } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";

type TabType = "pnl" | "gl" | "tb" | "channel";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pnl");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [channel, setChannel] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const queryParams = {
    from: from || undefined,
    to: to || undefined,
    channel: channel !== "all" ? channel : undefined,
  };

  const pnlQuery = usePnLReport(queryParams);
  const glQuery = useGLReport({ from: from || undefined, to: to || undefined });
  const tbQuery = useTrialBalanceReport({ from: from || undefined, to: to || undefined });
  const channelQuery = useRevenueByChannelReport({ from: from || undefined, to: to || undefined });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      let endpoint = "/finance/export/pnl";
      let filename = `pnl-report-${from}-to-${to}.xlsx`;

      if (activeTab === "gl") {
        endpoint = "/finance/export/journal";
        filename = `general-ledger-${from}-to-${to}.xlsx`;
      }

      await financeApi.downloadExport(endpoint, filename, queryParams);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === "pnl") pnlQuery.refetch();
    if (activeTab === "gl") glQuery.refetch();
    if (activeTab === "tb") tbQuery.refetch();
    if (activeTab === "channel") channelQuery.refetch();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            รายงานทางการเงิน (Financial Reports)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            รายงานกำไรขาดทุน, บัญชีแยกประเภท, งบทดลอง และรายได้แยกตามช่องทาง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} />
            รีเฟรช
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={14} />
            {isExporting ? "กำลังส่งออก..." : "ส่งออก Excel"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("pnl")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "pnl"
                ? "bg-white text-neutral-900 shadow-sm font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <BarChart2 size={14} />
            กำไร-ขาดทุน (P&L)
          </button>
          <button
            onClick={() => setActiveTab("gl")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "gl"
                ? "bg-white text-neutral-900 shadow-sm font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <BookOpen size={14} />
            แยกประเภท (GL)
          </button>
          <button
            onClick={() => setActiveTab("tb")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "tb"
                ? "bg-white text-neutral-900 shadow-sm font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Scale size={14} />
            งบทดลอง (Trial Balance)
          </button>
          <button
            onClick={() => setActiveTab("channel")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "channel"
                ? "bg-white text-neutral-900 shadow-sm font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <PieChart size={14} />
            รายได้ตามช่องทาง
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-3">
          {activeTab === "pnl" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">ช่องทาง:</span>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs focus:border-neutral-900 focus:outline-none"
              >
                <option value="all">ทั้งหมด</option>
                <option value="TikTok">TikTok</option>
                <option value="Shopee">Shopee</option>
                <option value="LINE">LINE</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">ช่วงวันที่:</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs focus:border-neutral-900 focus:outline-none"
            />
            <span className="text-xs text-neutral-500">ถึง:</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content based on tab */}
      {activeTab === "pnl" && (
        <ReportPnLView report={pnlQuery.data} isLoading={pnlQuery.isLoading} />
      )}
      {activeTab === "gl" && (
        <ReportGLView rows={glQuery.data} isLoading={glQuery.isLoading} />
      )}
      {activeTab === "tb" && (
        <ReportTrialBalanceView rows={tbQuery.data} isLoading={tbQuery.isLoading} />
      )}
      {activeTab === "channel" && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">
            สัดส่วนรายได้ตามช่องทางการขาย (Revenue by Channel)
          </h3>
          <div className="space-y-4">
            {channelQuery.data?.by_channel?.map((item) => (
              <div key={item.channel} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-800 font-semibold">{item.channel}</span>
                  <span className="font-mono text-neutral-900">
                    ฿{item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {(!channelQuery.data?.by_channel || channelQuery.data.by_channel.length === 0) && (
              <p className="text-xs text-neutral-500 py-6 text-center">ไม่มีข้อมูลรายได้ในช่วงเวลานี้</p>
            )}
          </div>
        </div>
      )}
      </div>
    </PageContainer>
  );
}

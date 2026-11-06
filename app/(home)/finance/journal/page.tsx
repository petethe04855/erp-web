"use client";

import React, { useState } from "react";
import { useJournalEntries } from "@/features/finance/queries/useFinanceQueries";
import { financeApi } from "@/features/finance/api/financeApi";
import { JournalTable } from "@/features/finance/components/JournalTable";
import { JournalDetailModal } from "@/features/finance/components/JournalDetailModal";
import type { JournalEntry } from "@/features/finance/types/finance";
import { Download, Search, Filter, RefreshCw } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";

export default function JournalPage() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sourceType, setSourceType] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useJournalEntries({
    page,
    limit: 20,
    from: from || undefined,
    to: to || undefined,
    source_type: sourceType !== "all" ? sourceType : undefined,
    search: search || undefined,
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await financeApi.downloadExport(
        "/finance/export/journal",
        `journal-export-${new Date().toISOString().split("T")[0]}.xlsx`,
        {
          from: from || undefined,
          to: to || undefined,
          source_type: sourceType !== "all" ? sourceType : undefined,
        }
      );
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              สมุดรายวันทั่วไป (General Journal)
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              บันทึกรายการบัญชีสองด้าน (Double-Entry) อัตโนมัติจากทุกเหตุการณ์ธุรกิจ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
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
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="ค้นหารหัสสมุด, เอกสารอ้างอิง..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">ประเภท:</span>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none"
            >
              <option value="all">ทั้งหมด</option>
              <option value="expense">Expense (ค่าใช้จ่าย)</option>
              <option value="goods_receipt">Goods Receipt (รับของ)</option>
              <option value="order_delivery">Order Delivery (ส่งสินค้า)</option>
              <option value="customer_invoice">Customer Invoice (ใบแจ้งหนี้)</option>
              <option value="customer_payment">Customer Payment (รับชำระ)</option>
              <option value="sales_return">Sales Return (รับคืน)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">จาก:</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none"
            />
            <span className="text-xs text-neutral-500">ถึง:</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <JournalTable
          entries={data?.data || []}
          isLoading={isLoading}
          onSelectEntry={(entry) => setSelectedEntry(entry)}
        />

        {/* Modal */}
        <JournalDetailModal
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      </div>
    </PageContainer>
  );
}

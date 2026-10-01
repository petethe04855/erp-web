"use client";

import React, { useState } from "react";
import { Search, Calendar, Trash2, ChevronLeft, ChevronRight, DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { shopeeApi } from "../api/shopee.api";
import type { ShopeeIncome } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";

interface Props {
  incomes: ShopeeIncome[];
  meta?: ApiPaginationMeta;
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  search: string;
  setSearch: (s: string) => void;
  status: string;
  setStatus: (s: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  onRefresh: () => void;
}

export function ShopeeIncomeTable({
  incomes,
  meta,
  loading,
  page,
  setPage,
  search,
  setSearch,
  status,
  setStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onRefresh,
}: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, orderId: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการโอนเงินของ Order ${orderId}?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await shopeeApi.deleteIncome(id);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete income record");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar - Matching ERP Dashboard Filter Style */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหา Order ID..."
            className="h-8 pl-8 text-xs font-normal"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs">
            {(
              [
                { id: "all", label: "ทั้งหมด" },
                { id: "matched", label: "จับคู่ออเดอร์แล้ว" },
                { id: "unmatched", label: "ยังไม่พบออเดอร์" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStatus(s.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  status === s.id
                    ? "bg-white text-neutral-900 shadow-xs font-semibold dark:bg-neutral-900 dark:text-neutral-100"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800/80">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-[11px] text-neutral-500 font-medium">วันที่โอน:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-6 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
            />
            <span className="text-neutral-400">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-6 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
            />
          </div>

          {(search || startDate || endDate || status !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-neutral-500 hover:text-neutral-900"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              ล้างตัวกรอง
            </Button>
          )}

          <div className="font-mono text-xs text-neutral-500 pl-2">
            {meta ? `${meta.total.toLocaleString()} รายการ` : `${incomes.length} รายการ`}
          </div>
        </div>
      </div>

      {/* Incomes Table Container */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">วันที่สั่งซื้อ</th>
                <th className="px-4 py-3">วันที่โอนเงินสำเร็จ (Transfer Date)</th>
                <th className="px-4 py-3">สถานะการจับคู่</th>
                <th className="px-4 py-3 text-right">ยอดเงินโอนสุทธิ (฿)</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <span>กำลังโหลดรายการโอนเงิน...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && incomes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <DollarSign className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                    <span>ไม่พบข้อมูลรายงานการโอนเงินในช่วงที่เลือก</span>
                  </td>
                </tr>
              )}

              {!loading &&
                incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {inc.order_id}
                    </td>

                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {inc.order_date ? new Date(inc.order_date).toLocaleDateString("th-TH") : "-"}
                    </td>

                    <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                      {inc.transfer_date ? new Date(inc.transfer_date).toLocaleString("th-TH") : "-"}
                    </td>

                    <td className="px-4 py-3">
                      {inc.is_matched ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          พบออเดอร์ในระบบ
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          ยังไม่นำเข้าออเดอร์
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ฿{inc.net_amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600"
                        onClick={() => handleDelete(inc.id, inc.order_id)}
                        disabled={deletingId === inc.id}
                        title="ลบรายการ"
                      >
                        {deletingId === inc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.total > (meta.limit || 50) && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800">
            <div>
              แสดงหน้า {meta.page} จากทั้งหมด {meta.totalPages || Math.ceil(meta.total / (meta.limit || 50))} หน้า (ทั้งหมด{" "}
              {meta.total.toLocaleString()} รายการ)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={page >= (meta.totalPages || Math.ceil(meta.total / (meta.limit || 50)))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

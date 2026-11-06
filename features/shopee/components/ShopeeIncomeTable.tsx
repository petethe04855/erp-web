"use client";

import React, { useState } from "react";
import {
  Trash2,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/common/Pagination";
import { shopeeApi } from "../api/shopee.api";
import type { ShopeeIncome } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";

interface Props {
  incomes: ShopeeIncome[];
  meta?: ApiPaginationMeta;
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onRefresh: () => void;
}

export function ShopeeIncomeTable({
  incomes,
  meta,
  loading,
  page,
  setPage,
  limit = 50,
  onLimitChange,
  onRefresh,
}: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, orderId: string) => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบรายการโอนเงินของ Order ${orderId}?`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await shopeeApi.deleteIncome(id);
      onRefresh();
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to delete income record",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = meta
    ? meta.totalPages || Math.ceil(meta.total / (meta.limit || limit || 50))
    : 1;

  return (
    <div className="space-y-4">
      {/* Incomes Table Container */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">วันที่สั่งซื้อ</th>
                <th className="px-4 py-3">วันที่โอนเงิน (Transfer Date)</th>
                <th className="px-4 py-3 text-right">
                  ยอดเงินโอนสุทธิ (Net Amount)
                </th>
                <th className="px-4 py-3 text-center">สถานะการจับคู่</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      <span>กำลังโหลดรายการรายงานรายรับ...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && incomes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-neutral-500"
                  >
                    <DollarSign className="mx-auto mb-2 h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                    <span>ไม่พบข้อมูลรายงานรายรับ Shopee ในช่วงที่เลือก</span>
                  </td>
                </tr>
              )}

              {!loading &&
                incomes.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {inc.order_id}
                    </td>

                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {inc.order_date
                        ? new Date(inc.order_date).toLocaleDateString("th-TH")
                        : "-"}
                    </td>

                    <td className="px-4 py-3 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {inc.transfer_date
                        ? new Date(inc.transfer_date).toLocaleDateString(
                            "th-TH",
                          )
                        : "-"}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      ฿
                      {inc.net_amount.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {inc.order_date ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          จับคู่ออเดอร์แล้ว
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-300 text-[10px] dark:border-amber-800"
                        >
                          <AlertCircle className="mr-1 h-3 w-3" />
                          ยังไม่พบออเดอร์
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-red-600"
                        disabled={deletingId === inc.id}
                        onClick={() => handleDelete(inc.id, inc.order_id)}
                        title="ลบรายการรายรับ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total > 0 && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 p-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={meta.total}
              limit={limit || meta.limit || 50}
              limitOptions={[10, 20, 50, 100]}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                onLimitChange?.(newLimit);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

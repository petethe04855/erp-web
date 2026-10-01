"use client";

import React from "react";
import { Loader2, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MatchingItemRow } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";
import { Pagination } from "@/components/common/Pagination";

interface Props {
  month: string;
  meta?: ApiPaginationMeta;
  items: MatchingItemRow[];
  loading: boolean;
  page?: number;
  setPage?: (p: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onRefresh?: () => void;
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

export function ShopeeMatchingTable({
  month,
  items,
  meta,
  loading,
  page = 1,
  setPage,
  limit = 10,
  onLimitChange,
  onRefresh,
}: Props) {
  const totalPages = meta
    ? meta.totalPages || Math.ceil(meta.total / (meta.limit || limit || 10))
    : 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OK":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            ปกติ
          </Badge>
        );
      case "MISSING_COST":
        return (
          <Badge
            variant="outline"
            className="text-amber-600 border-amber-300 text-[10px] dark:border-amber-800"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            ยังไม่มีต้นทุน
          </Badge>
        );
      case "NEGATIVE_PROFIT":
        return (
          <Badge variant="destructive" className="text-[10px]">
            <TrendingDown className="mr-1 h-3 w-3" />
            กำไรติดลบ
          </Badge>
        );
      case "MISSING_ORDER":
        return (
          <Badge variant="outline" className="text-zinc-500 text-[10px]">
            ไม่พบออเดอร์
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
            <tr>
              <th className="px-3 py-3">วันที่โอน / Order ID</th>
              <th className="px-3 py-3">SKU & ชื่อสินค้า</th>
              <th className="px-3 py-3 text-center">จำนวน</th>
              <th className="px-3 py-3 text-right">ยอดขายรวม (Line Sale)</th>
              <th className="px-3 py-3 text-right">ต้นทุนรวม (Cost)</th>
              <th className="px-3 py-3 text-right">ค่าธรรมเนียมจัดสรร</th>
              <th className="px-3 py-3 text-right">ยอดโอนจัดสรร (Net)</th>
              <th className="px-3 py-3 text-right">กำไรสุทธิ (Profit)</th>
              <th className="px-3 py-3 text-right">Margin %</th>
              <th className="px-3 py-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading && (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                    <span>กำลังคำนวณและประมวลผลการจับคู่...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-neutral-500">
                  <span>
                    ไม่พบข้อมูลการโอนเงินของเดือน {formatThaiMonth(month)}
                  </span>
                </td>
              </tr>
            )}

            {!loading &&
              items.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30"
                >
                  <td className="px-3 py-2.5">
                    <div className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {row.transfer_date
                        ? new Date(row.transfer_date).toLocaleDateString(
                            "th-TH",
                          )
                        : "-"}
                    </div>
                    <div className="font-mono text-neutral-900 dark:text-neutral-100">
                      {row.order_id}
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="font-mono font-bold text-orange-600 dark:text-orange-400">
                      {row.sku || (
                        <span className="text-neutral-400 italic">
                          ไม่มี SKU
                        </span>
                      )}
                    </div>
                    <div
                      className="max-w-[200px] truncate text-neutral-500"
                      title={row.product_name}
                    >
                      {row.product_name}
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-center font-medium">
                    {row.qty || 1}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {row.line_sale.toFixed(2)}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono text-neutral-600 dark:text-neutral-400">
                    {row.total_cost.toFixed(2)}
                    <div className="text-[10px] text-neutral-400">
                      @{row.effective_cost.toFixed(2)}
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">
                    -{row.allocated_fee.toFixed(2)}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.allocated_net.toFixed(2)}
                  </td>

                  <td
                    className={`px-3 py-2.5 text-right font-mono font-bold ${
                      row.profit >= 0
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {row.profit.toFixed(2)}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono font-medium">
                    {row.margin_pct.toFixed(1)}%
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    {getStatusBadge(row.status)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {meta && meta.total > 0 && setPage && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 p-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={meta.total}
            limit={limit || meta.limit || 10}
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
  );
}

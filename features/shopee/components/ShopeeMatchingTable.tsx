"use client";

import React from "react";
import {
  Download,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { MatchingItemRow } from "../types/shopee.types";

interface Props {
  month: string;
  setMonth: (m: string) => void;
  items: MatchingItemRow[];
  loading: boolean;
  onExportCSV: () => void;
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
  setMonth,
  items,
  loading,
  onExportCSV,
}: Props) {
  const getCurrentYM = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const currentYM = getCurrentYM();
  const isCurrentMonth = month === currentYM;

  const shiftMonth = (offset: number) => {
    const [yStr, mStr] = (month || currentYM).split("-");
    const d = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1 + offset, 1);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, "0");
    setMonth(`${newY}-${newM}`);
  };

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
          <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px] dark:border-amber-800">
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
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Toolbar - Styled identically to ภาพรวมธุรกิจและการเงิน */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Stepper Controller */}
          <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              onClick={() => shiftMonth(-1)}
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-7 w-32 border-none p-0 text-xs font-semibold text-center focus-visible:ring-0"
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              onClick={() => shiftMonth(1)}
              title="เดือนถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month Status & Reset Button */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md font-medium text-neutral-700 dark:text-neutral-300">
              {isCurrentMonth
                ? `📅 เดือนปัจจุบัน: ${formatThaiMonth(month)}`
                : `🕰️ ดูย้อนหลัง: ${formatThaiMonth(month)}`}
            </span>

            {!isCurrentMonth && (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2.5 text-[11px] font-medium"
                onClick={() => setMonth(currentYM)}
              >
                กลับสู่เดือนปัจจุบัน
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-mono">
            {items.length.toLocaleString()} รายการ
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            disabled={loading || items.length === 0}
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200"
          >
            <Download className="mr-2 h-4 w-4 text-emerald-600" />
            ส่งออกรายงาน CSV
          </Button>
        </div>
      </div>

      {/* Table Container */}
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
                    <span>ไม่พบข้อมูลการโอนเงินของเดือน {formatThaiMonth(month)}</span>
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {row.transfer_date ? new Date(row.transfer_date).toLocaleDateString("th-TH") : "-"}
                      </div>
                      <div className="font-mono text-neutral-900 dark:text-neutral-100">{row.order_id}</div>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-orange-600 dark:text-orange-400">
                        {row.sku || <span className="text-neutral-400 italic">ไม่มี SKU</span>}
                      </div>
                      <div className="max-w-[200px] truncate text-neutral-500" title={row.product_name}>
                        {row.product_name}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-center font-medium">{row.qty || 1}</td>

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

                    <td className="px-3 py-2.5 text-center">{getStatusBadge(row.status)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

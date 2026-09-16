import React from "react";
import { Quotation } from "../types/quotation";
import { money } from "@/features/orders/types/order";

interface QuotationStatsRowProps {
  quotations: Quotation[];
}

export function QuotationStatsRow({ quotations }: QuotationStatsRowProps) {
  const count = quotations.length;
  const totalAmount = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
  const activeCount = quotations.filter(
    (q) => !q.isExpired && q.status !== "Rejected" && q.status !== "Converted"
  ).length;
  const expiredCount = quotations.filter((q) => q.isExpired).length;
  const convertedCount = quotations.filter((q) => q.status === "Converted").length;
  const conversionRate = count > 0 ? (convertedCount / count) * 100 : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-card border border-border rounded-xl shadow-sm text-xs">
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          มูลค่ารวมในหน้านี้
        </span>
        <div className="text-base font-bold text-foreground">{money(totalAmount)}</div>
        <div className="text-[11px] text-muted-foreground">{count} ฉบับ</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          ใบเสนอราคาที่ใช้งานได้
        </span>
        <div className="text-base font-bold text-emerald-600">{activeCount} ฉบับ</div>
        <div className="text-[11px] text-muted-foreground">ยังไม่หมดอายุ/ปฏิเสธ</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          หมดอายุ (Expired)
        </span>
        <div className="text-base font-bold text-rose-600">{expiredCount} ฉบับ</div>
        <div className="text-[11px] text-muted-foreground">เกินกำหนดอายุข้อเสนอ</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          อัตราแปลงเป็น SO
        </span>
        <div className="text-base font-bold text-primary">{conversionRate.toFixed(1)}%</div>
        <div className="text-[11px] text-muted-foreground">{convertedCount} ใบสำเร็จ</div>
      </div>
    </div>
  );
}

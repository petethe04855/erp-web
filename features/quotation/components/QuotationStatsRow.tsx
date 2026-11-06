import React from "react";
import { Quotation } from "../types/quotation";
import { money } from "@/features/orders/types/order";

interface QuotationStatsRowProps {
  quotations: Quotation[];
}

export function QuotationStatsRow({ quotations }: QuotationStatsRowProps) {
  const count = quotations.length;
  const totalAmount = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-card border border-border rounded-xl shadow-sm text-xs">
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          มูลค่ารวมในหน้านี้
        </span>
        <div className="text-base font-bold text-foreground">{money(totalAmount)}</div>
        <div className="text-[11px] text-muted-foreground">คำนวณจากรายการที่แสดง</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          จำนวนใบเสนอราคา
        </span>
        <div className="text-base font-bold text-foreground">{count} ฉบับ</div>
        <div className="text-[11px] text-muted-foreground">ทั้งหมดในหน้านี้</div>
      </div>
    </div>
  );
}

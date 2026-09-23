import React from "react";
import { Invoice } from "../types/invoice";
import { money } from "@/features/orders/types/order";

interface InvoiceStatsRowProps {
  invoices: Invoice[];
}

export function InvoiceStatsRow({ invoices }: InvoiceStatsRowProps) {
  const count = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const overdueCount = invoices.filter((inv) => inv.isOverdue).length;
  const overdueAmount = invoices
    .filter((inv) => inv.isOverdue)
    .reduce((sum, inv) => sum + (inv.balance != null ? inv.balance : Number(inv.totalAmount) || 0), 0);
  const paidCount = invoices.filter((inv) => (inv.status || "").toUpperCase() === "PAID").length;
  const outstandingAmount = invoices.reduce((sum, inv) => {
    if ((inv.status || "").toUpperCase() === "PAID") return sum;
    return sum + (inv.balance != null ? inv.balance : Number(inv.totalAmount) || 0);
  }, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-card border border-border rounded-xl shadow-sm text-xs">
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          มูลค่าใบแจ้งหนี้รวม
        </span>
        <div className="text-base font-bold text-foreground">{money(totalAmount)}</div>
        <div className="text-[11px] text-muted-foreground">{count} ใบในหน้านี้</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          ยอดคงค้างชำระ
        </span>
        <div className="text-base font-bold text-amber-600">{money(outstandingAmount)}</div>
        <div className="text-[11px] text-muted-foreground">รอการชำระเงิน</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          เกินกำหนด (Overdue)
        </span>
        <div className="text-base font-bold text-rose-600">{money(overdueAmount)}</div>
        <div className="text-[11px] text-rose-600 font-medium">{overdueCount} ใบเกินกำหนด</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          ชำระแล้ว (Paid)
        </span>
        <div className="text-base font-bold text-emerald-600">{paidCount} ใบ</div>
        <div className="text-[11px] text-muted-foreground">เสร็จสมบูรณ์</div>
      </div>
    </div>
  );
}

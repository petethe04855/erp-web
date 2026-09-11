import React from "react";
import { Order } from "../types/order";
import { money } from "../types/order";

interface OrderStatsRowProps {
  orders: Order[];
}

export function OrderStatsRow({ orders }: OrderStatsRowProps) {
  const count = orders.length;
  const totalAmount = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const avgAmount = count > 0 ? totalAmount / count : 0;
  const largestAmount = orders.reduce((max, o) => Math.max(max, Number(o.totalAmount) || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-card border border-border rounded-xl shadow-sm text-xs">
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          ยอดรวมในหน้านี้
        </span>
        <div className="text-base font-bold text-foreground">{money(totalAmount)}</div>
        <div className="text-[11px] text-muted-foreground">{count} รายการ</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          ยอดเฉลี่ยต่อใบ
        </span>
        <div className="text-base font-bold text-foreground">{money(avgAmount)}</div>
        <div className="text-[11px] text-muted-foreground">เฉลี่ยต่อคำสั่งซื้อ</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          ใบสั่งซื้อสูงสุด
        </span>
        <div className="text-base font-bold text-foreground">{money(largestAmount)}</div>
        <div className="text-[11px] text-muted-foreground">ในชุดข้อมูลที่แสดง</div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
          จำนวนคำสั่งซื้อ
        </span>
        <div className="text-base font-bold text-foreground">{count} ใบ</div>
        <div className="text-[11px] text-muted-foreground">พร้อมดำเนินการ</div>
      </div>
    </div>
  );
}

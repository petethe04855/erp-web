"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Invoice } from "../types/invoice";
import { money } from "@/features/orders/types/order";
import { Users, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";

interface CustomerDebt {
  customer: string;
  invoices: Invoice[];
  outstanding: number;
  overdue: number;
  nearestDue: string;
}

interface OutstandingCustomersPanelProps {
  invoices: Invoice[];
}

export function OutstandingCustomersPanel({ invoices }: OutstandingCustomersPanelProps) {
  const customers = useMemo(() => {
    const grouped = new Map<string, Invoice[]>();

    invoices
      .filter((inv) => {
        if (inv.status === "Paid") return false;
        const bal = inv.balance != null ? inv.balance : Number(inv.totalAmount) || 0;
        return bal > 0;
      })
      .forEach((inv) => {
        const name = inv.customerName || "ไม่ระบุลูกค้า";
        grouped.set(name, [...(grouped.get(name) || []), inv]);
      });

    return [...grouped.entries()]
      .map(([customer, rows]) => {
        const outstanding = rows.reduce(
          (sum, inv) => sum + (inv.balance != null ? inv.balance : Number(inv.totalAmount) || 0),
          0
        );
        const overdue = rows
          .filter((inv) => inv.isOverdue)
          .reduce(
            (sum, inv) => sum + (inv.balance != null ? inv.balance : Number(inv.totalAmount) || 0),
            0
          );
        const sortedDue = [...rows]
          .map((r) => r.dueDate)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        const nearestDue = sortedDue[0] || "—";

        return {
          customer,
          invoices: rows,
          outstanding,
          overdue,
          nearestDue,
        };
      })
      .sort((a, b) => {
        // Sort by overdue first, then outstanding amount
        if (b.overdue !== a.overdue) return b.overdue - a.overdue;
        return b.outstanding - a.outstanding;
      });
  }, [invoices]);

  if (!customers.length) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <span className="font-semibold">ไม่มีรายการค้างชำระในหน้านี้</span> —
          ใบแจ้งหนี้ทุกใบในชุดข้อมูลนี้ชำระเงินครบถ้วนแล้ว
        </div>
      </div>
    );
  }

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const totalOverdue = customers.reduce((sum, c) => sum + c.overdue, 0);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden text-xs">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2 font-medium">
          <Users className="h-4 w-4 text-primary" />
          <span>ลูกค้าที่มียอดค้างชำระ ({customers.length} ราย)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">
            ค้างรวม: <strong className="text-foreground">{money(totalOutstanding)}</strong>
          </span>
          {totalOverdue > 0 && (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              เกินกำหนด: {money(totalOverdue)}
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-border/50 max-h-60 overflow-y-auto">
        {customers.map((c) => (
          <div
            key={c.customer}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-muted/30 transition-colors ${
              c.overdue > 0 ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
            }`}
          >
            <div className="space-y-0.5">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <span>{c.customer}</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  ({c.invoices.length} ใบ)
                </span>
                {c.overdue > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                    เกินกำหนด
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                ครบกำหนดใกล้สุด: <span className="font-mono">{c.nearestDue}</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <div className="font-bold text-foreground">{money(c.outstanding)}</div>
                {c.overdue > 0 && (
                  <div className="text-[10px] text-rose-600 font-medium">
                    เกินกำหนด {money(c.overdue)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {c.invoices.slice(0, 2).map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="inline-flex items-center px-2 py-1 rounded bg-muted/60 hover:bg-muted text-[11px] font-mono text-primary hover:underline transition-colors"
                  >
                    {inv.invoiceNumber}
                    <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Link>
                ))}
                {c.invoices.length > 2 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{c.invoices.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

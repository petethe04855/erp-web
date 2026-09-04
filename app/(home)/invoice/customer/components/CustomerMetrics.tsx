import React from "react";
import { Card } from "@/components/ui/card";
import { money, type CustomerTotals } from "./types";

interface CustomerMetricsProps {
  totals: CustomerTotals;
}

export function CustomerMetrics({ totals }: CustomerMetricsProps) {
  const metricCards = [
    { label: "ยอด Invoice เดิม", value: totals.original, isAlert: false },
    { label: "Credit Note", value: totals.credited, isAlert: false },
    { label: "ชำระแล้ว", value: totals.paid, isAlert: false },
    { label: "ยอดค้างชำระ", value: totals.outstanding, isAlert: false },
    { label: "เกินกำหนด", value: totals.overdue, isAlert: totals.overdue > 0 },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {metricCards.map(({ label, value, isAlert }) => (
        <Card key={label} className="p-4">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div
            className={`mt-1 text-xl font-bold ${
              isAlert ? "text-red-600" : ""
            }`}
          >
            {money(Number(value))}
          </div>
        </Card>
      ))}
    </div>
  );
}

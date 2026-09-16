"use client";

import React from "react";
import type { GeneralLedgerRow } from "../types/finance";

interface ReportGLViewProps {
  rows: GeneralLedgerRow[] | undefined;
  isLoading: boolean;
}

export function ReportGLView({ rows = [], isLoading }: ReportGLViewProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
          กำลังโหลดสมุดบัญชีแยกประเภททั่วไป (GL)...
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-900">ไม่มีรายการบัญชีแยกประเภทในช่วงเวลานี้</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600">
            <tr>
              <th className="px-4 py-3">วันที่</th>
              <th className="px-4 py-3">รหัสสมุด</th>
              <th className="px-4 py-3">รหัสบัญชี</th>
              <th className="px-4 py-3">ชื่อบัญชี</th>
              <th className="px-4 py-3">ช่องทาง</th>
              <th className="px-4 py-3 text-right">เดบิต</th>
              <th className="px-4 py-3 text-right">เครดิต</th>
              <th className="px-4 py-3 text-right">ยอดคงเหลือยกมา</th>
              <th className="px-4 py-3 text-right">ยอดคงเหลือสะสม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-neutral-600 whitespace-nowrap">
                  {row.date}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-neutral-900 whitespace-nowrap">
                  {row.journal_code}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-neutral-900 whitespace-nowrap">
                  {row.account_code}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-800 whitespace-nowrap">
                  {row.account_name}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 whitespace-nowrap">
                  {row.channel || "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-blue-700 whitespace-nowrap">
                  {row.debit > 0 ? `฿${row.debit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-emerald-700 whitespace-nowrap">
                  {row.credit > 0 ? `฿${row.credit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-neutral-500 whitespace-nowrap">
                  ฿{row.opening_balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-neutral-900 whitespace-nowrap">
                  ฿{row.running_balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

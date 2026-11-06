"use client";

import React from "react";
import type { TrialBalanceRow } from "../types/finance";

interface ReportTrialBalanceViewProps {
  rows: TrialBalanceRow[] | undefined;
  isLoading: boolean;
}

export function ReportTrialBalanceView({ rows = [], isLoading }: ReportTrialBalanceViewProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
          กำลังโหลดงบทดลอง (Trial Balance)...
        </div>
      </div>
    );
  }

  const totalOpenDebit = rows.reduce((s, r) => s + (r.opening_debit || 0), 0);
  const totalOpenCredit = rows.reduce((s, r) => s + (r.opening_credit || 0), 0);
  const totalDebit = rows.reduce((s, r) => s + (r.debit || 0), 0);
  const totalCredit = rows.reduce((s, r) => s + (r.credit || 0), 0);
  const totalEndDebit = rows.reduce((s, r) => s + (r.ending_debit || 0), 0);
  const totalEndCredit = rows.reduce((s, r) => s + (r.ending_credit || 0), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600">
            <tr>
              <th rowSpan={2} className="px-4 py-3 border-r border-neutral-200">รหัสบัญชี</th>
              <th rowSpan={2} className="px-4 py-3 border-r border-neutral-200">ชื่อบัญชี</th>
              <th rowSpan={2} className="px-4 py-3 border-r border-neutral-200">ประเภท</th>
              <th colSpan={2} className="px-4 py-2 text-center border-b border-r border-neutral-200">ยอดยกมา (Opening)</th>
              <th colSpan={2} className="px-4 py-2 text-center border-b border-r border-neutral-200">รายการระหว่างงวด (Period)</th>
              <th colSpan={2} className="px-4 py-2 text-center">ยอดคงเหลือปลายงวด (Ending)</th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-right border-r border-neutral-200">เดบิต</th>
              <th className="px-4 py-2 text-right border-r border-neutral-200">เครดิต</th>
              <th className="px-4 py-2 text-right border-r border-neutral-200">เดบิต</th>
              <th className="px-4 py-2 text-right border-r border-neutral-200">เครดิต</th>
              <th className="px-4 py-2 text-right border-r border-neutral-200">เดบิต</th>
              <th className="px-4 py-2 text-right">เครดิต</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr key={row.account_code} className="hover:bg-neutral-50/70 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-neutral-900 border-r border-neutral-100 whitespace-nowrap">
                  {row.account_code}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-800 border-r border-neutral-100 whitespace-nowrap">
                  {row.account_name}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 border-r border-neutral-100 whitespace-nowrap">
                  {row.account_type}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-neutral-700 border-r border-neutral-100 whitespace-nowrap">
                  {row.opening_debit > 0 ? `฿${row.opening_debit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-neutral-700 border-r border-neutral-100 whitespace-nowrap">
                  {row.opening_credit > 0 ? `฿${row.opening_credit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-blue-700 border-r border-neutral-100 whitespace-nowrap">
                  {row.debit > 0 ? `฿${row.debit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-700 border-r border-neutral-100 whitespace-nowrap">
                  {row.credit > 0 ? `฿${row.credit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-blue-800 border-r border-neutral-100 whitespace-nowrap">
                  {row.ending_debit > 0 ? `฿${row.ending_debit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-emerald-800 whitespace-nowrap">
                  {row.ending_credit > 0 ? `฿${row.ending_credit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-neutral-50 font-semibold text-neutral-900 border-t-2 border-neutral-300">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-neutral-500 border-r border-neutral-200">
                รวมยอดทดลอง (Total)
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs border-r border-neutral-200">
                ฿{totalOpenDebit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs border-r border-neutral-200">
                ฿{totalOpenCredit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-blue-700 border-r border-neutral-200">
                ฿{totalDebit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-emerald-700 border-r border-neutral-200">
                ฿{totalCredit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-blue-800 border-r border-neutral-200">
                ฿{totalEndDebit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-emerald-800">
                ฿{totalEndCredit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

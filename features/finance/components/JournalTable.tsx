"use client";

import React from "react";
import type { JournalEntry } from "../types/finance";
import { Eye, ArrowUpDown } from "lucide-react";

interface JournalTableProps {
  entries: JournalEntry[];
  isLoading: boolean;
  onSelectEntry: (entry: JournalEntry) => void;
}

export function JournalTable({ entries, isLoading, onSelectEntry }: JournalTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
          กำลังโหลดสมุดรายวัน...
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-900">ไม่พบรายการสมุดรายวัน</p>
        <p className="text-xs text-neutral-500 mt-1">
          เมื่อมีเหตุการณ์ธุรกิจ (เช่น ซื้อของ, ขายสินค้า, บันทึกค่าใช้จ่าย) รายการจะปรากฏที่นี่โดยอัตโนมัติ
        </p>
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
              <th className="px-4 py-3">รหัสสมุดรายวัน</th>
              <th className="px-4 py-3">แหล่งที่มา (Source)</th>
              <th className="px-4 py-3">รายละเอียด</th>
              <th className="px-4 py-3 text-right">ยอดเดบิตรวม</th>
              <th className="px-4 py-3 text-right">ยอดเครดิตรวม</th>
              <th className="px-4 py-3 text-center">สถานะ</th>
              <th className="px-4 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {entries.map((entry) => {
              const debitTotal = entry.lines?.reduce((sum, l) => sum + (l.debit || 0), 0) || 0;
              const creditTotal = entry.lines?.reduce((sum, l) => sum + (l.credit || 0), 0) || 0;

              return (
                <tr
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="cursor-pointer hover:bg-neutral-50/70 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600 whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-xs text-neutral-900 whitespace-nowrap">
                    {entry.code}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                      {entry.source_type}
                    </span>
                    {entry.source_ref && (
                      <span className="ml-1.5 font-mono text-xs text-neutral-500">
                        ({entry.source_ref})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-700 max-w-xs truncate" title={entry.description}>
                    {entry.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">
                    ฿{debitTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-emerald-700 whitespace-nowrap">
                    ฿{creditTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntry(entry);
                      }}
                      className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                      title="ดูรายละเอียดบัญชี"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

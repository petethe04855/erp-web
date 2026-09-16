"use client";

import React from "react";
import type { JournalEntry, JournalLine } from "../types/finance";
import { X, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface JournalDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JournalDetailModal({ entry, isOpen, onClose }: JournalDetailModalProps) {
  if (!isOpen || !entry) return null;

  const totalDebit = entry.lines?.reduce((sum, l) => sum + (l.debit || 0), 0) || 0;
  const totalCredit = entry.lines?.reduce((sum, l) => sum + (l.credit || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">
                สมุดรายวัน: {entry.code}
              </h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                {entry.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              วันที่: {entry.date} • แหล่งที่มา: <span className="font-medium text-neutral-700">{entry.source_type}</span> ({entry.source_ref})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {entry.description && (
            <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-700 border border-neutral-100">
              <span className="font-semibold text-neutral-800">คำอธิบาย: </span>
              {entry.description}
            </div>
          )}

          {/* Double-entry lines table */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-600 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5">รหัสบัญชี</th>
                  <th className="px-4 py-2.5">ชื่อบัญชี</th>
                  <th className="px-4 py-2.5">ช่องทาง/ข้อมูล</th>
                  <th className="px-4 py-2.5 text-right">เดบิต (Debit)</th>
                  <th className="px-4 py-2.5 text-right">เครดิต (Credit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {entry.lines?.map((line: JournalLine) => (
                  <tr key={line.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-neutral-900">
                      {line.account_code}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-800">
                      {line.account_name}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">
                      {line.channel && <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 mr-1.5">{line.channel}</span>}
                      {line.sku && <span className="font-mono text-neutral-600">{line.sku}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-neutral-900">
                      {line.debit > 0 ? (
                        <span className="inline-flex items-center gap-1 text-blue-700">
                          <ArrowDownRight size={14} />
                          {line.debit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-neutral-900">
                      {line.credit > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <ArrowUpRight size={14} />
                          {line.credit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50 font-semibold text-neutral-900 border-t border-neutral-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-neutral-500">
                    รวมทั้งสิ้น (Total)
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-blue-700">
                    ฿{totalDebit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">
                    ฿{totalCredit.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
            <div>สร้างโดย: {entry.created_by || "System"}</div>
            <div>บันทึกเมื่อ: {entry.posted_at ? new Date(entry.posted_at).toLocaleString("th-TH") : "-"}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-3 bg-neutral-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-white border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

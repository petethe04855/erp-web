"use client";

import React from "react";
import type { Expense } from "../types/finance";
import { Edit2, Trash2, Tag, Store } from "lucide-react";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export function ExpenseTable({ expenses, isLoading, onEdit, onDelete }: ExpenseTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
          กำลังโหลดรายการค่าใช้จ่าย...
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-900">ยังไม่มีรายการค่าใช้จ่าย</p>
        <p className="text-xs text-neutral-500 mt-1">
          คลิกปุ่ม "บันทึกค่าใช้จ่าย" เพื่อเพิ่มรายการค่าใช้จ่ายใหม่และลงบัญชีอัตโนมัติ
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
              <th className="px-4 py-3">รหัสเอกสาร</th>
              <th className="px-4 py-3">หมวดหมู่</th>
              <th className="px-4 py-3">ช่องทาง</th>
              <th className="px-4 py-3">ผู้รับเงิน / ร้านค้า</th>
              <th className="px-4 py-3">รายละเอียด</th>
              <th className="px-4 py-3 text-right">จำนวนเงิน</th>
              <th className="px-4 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-neutral-50/70 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-neutral-600 whitespace-nowrap">
                  {exp.date}
                </td>
                <td className="px-4 py-3 font-mono font-medium text-xs text-neutral-900 whitespace-nowrap">
                  {exp.code}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                    <Tag size={12} />
                    {exp.category}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    <Store size={12} />
                    {exp.channel}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-800 whitespace-nowrap">
                  {exp.vendor || "-"}
                  {exp.invoice_ref && (
                    <span className="block font-mono text-[10px] text-neutral-400">
                      Ref: {exp.invoice_ref}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600 max-w-xs truncate" title={exp.description}>
                  {exp.description || "-"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs font-bold text-neutral-900 whitespace-nowrap">
                  ฿{exp.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(exp)}
                      className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบรายการค่าใช้จ่าย ${exp.code} หรือไม่?`)) {
                          onDelete(exp.id);
                        }
                      }}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                      title="ลบ"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

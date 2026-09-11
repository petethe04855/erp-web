"use client";

import React, { useState, useEffect } from "react";
import type { Expense, ExpenseCategory, ExpenseChannel, CreateExpenseDTO } from "../types/finance";
import { X, Loader2 } from "lucide-react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseDTO) => Promise<void>;
  initialData?: Expense | null;
  isLoading?: boolean;
}

const CATEGORIES: ExpenseCategory[] = [
  "ค่าโฆษณา",
  "ค่าธรรมเนียมแพลตฟอร์ม",
  "ต้นทุนขาย/วัตถุดิบ",
  "ค่าใช้จ่ายในการบริหาร",
  "ค่าขนส่ง",
  "ค่าแรง/เงินเดือน",
  "อื่นๆ",
];

const CHANNELS: ExpenseChannel[] = [
  "ทั่วไป",
  "TikTok",
  "Shopee",
  "LINE",
  "Manual",
];

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<CreateExpenseDTO>({
    date: new Date().toISOString().split("T")[0],
    category: "ค่าใช้จ่ายในการบริหาร",
    channel: "ทั่วไป",
    amount: 0,
    vendor: "",
    invoice_ref: "",
    description: "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        category: initialData.category,
        channel: initialData.channel,
        amount: initialData.amount,
        vendor: initialData.vendor || "",
        invoice_ref: initialData.invoice_ref || "",
        description: initialData.description || "",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "ค่าใช้จ่ายในการบริหาร",
        channel: "ทั่วไป",
        amount: 0,
        vendor: "",
        invoice_ref: "",
        description: "",
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      setError("กรุณากรอกยอดเงินค่าใช้จ่ายที่มากกว่า 0");
      return;
    }

    try {
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/50">
          <h2 className="text-lg font-bold text-neutral-900">
            {initialData ? "แก้ไขค่าใช้จ่าย" : "บันทึกค่าใช้จ่ายใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                วันที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                จำนวนเงิน (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                หมวดหมู่ค่าใช้จ่าย <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                ช่องทาง / แผนก
              </label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value as ExpenseChannel })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                ผู้รับเงิน / ร้านค้า (Vendor)
              </label>
              <input
                type="text"
                placeholder="เช่น TikTok Pte, ขนส่ง Flash"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                เลขที่เอกสารอ้างอิง
              </label>
              <input
                type="text"
                placeholder="เช่น เลขที่ใบเสร็จ/บิล"
                value={formData.invoice_ref}
                onChange={(e) => setFormData({ ...formData, invoice_ref: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows={3}
              placeholder="รายละเอียดค่าใช้จ่ายเพิ่มเติม..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {initialData ? "บันทึกการแก้ไข" : "บันทึกค่าใช้จ่าย"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

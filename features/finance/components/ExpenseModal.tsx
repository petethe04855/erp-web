"use client";

import React, { useState, useEffect, useRef } from "react";
import type {
  Expense,
  ExpenseCategory,
  ExpenseChannel,
  CreateExpenseDTO,
} from "../types/finance";
import { financeApi } from "../api/financeApi";
import { getImageUrl } from "@/lib/utils";
import {
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Package,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";

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
    product_name: "",
    purchase_url: "",
    slip_url: "",
    vendor: "",
    invoice_ref: "",
    description: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        category: initialData.category || "ค่าใช้จ่ายในการบริหาร",
        channel: initialData.channel || "ทั่วไป",
        amount: initialData.amount,
        product_name: initialData.product_name || "",
        purchase_url: initialData.purchase_url || "",
        slip_url: initialData.slip_url || "",
        vendor: initialData.vendor || "",
        invoice_ref: initialData.invoice_ref || "",
        description: initialData.description || "",
      });
      setSelectedFile(null);
      setLocalPreview(
        initialData.slip_url ? getImageUrl(initialData.slip_url) : "",
      );
      // Show advanced if vendor or invoice_ref exists
      if (initialData.vendor || initialData.invoice_ref) {
        setShowAdvanced(true);
      }
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "ค่าใช้จ่ายในการบริหาร",
        channel: "ทั่วไป",
        amount: 0,
        product_name: "",
        purchase_url: "",
        slip_url: "",
        vendor: "",
        invoice_ref: "",
        description: "",
      });
      setSelectedFile(null);
      setLocalPreview("");
      setShowAdvanced(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("รองรับเฉพาะไฟล์รูปภาพ .png, .jpg หรือ .jpeg เท่านั้น");
      return;
    }

    // Validate size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์รูปภาพต้องไม่เกิน 5 MB");
      return;
    }

    // Create instant local preview - DO NOT upload until user clicks submit
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    const localUrl = URL.createObjectURL(file);
    setLocalPreview(localUrl);
    setSelectedFile(file);
    setError(null);
  };

  const handleRemoveSlip = () => {
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview("");
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, slip_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleModalClose = () => {
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name?.trim()) {
      setError("กรุณากรอกชื่อสินค้า / รายการสิ่งของ");
      return;
    }
    if (formData.amount <= 0) {
      setError("กรุณากรอกยอดเงินค่าใช้จ่ายที่มากกว่า 0");
      return;
    }

    try {
      setIsUploadingSlip(true);
      setError(null);

      let finalSlipUrl = formData.slip_url || "";
      // Upload file to server ONLY when user clicks save
      if (selectedFile) {
        finalSlipUrl = await financeApi.uploadSlip(selectedFile);
      }

      await onSubmit({ ...formData, slip_url: finalSlipUrl });
      handleModalClose();
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsUploadingSlip(false);
    }
  };

  const activePreview =
    localPreview || (formData.slip_url ? getImageUrl(formData.slip_url) : "");

  return (
    <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-white">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {initialData ? "แก้ไขค่าใช้จ่าย" : "บันทึกค่าใช้จ่ายใหม่"}
              </h2>
              <p className="text-xs text-neutral-500">
                กรอกรายละเอียดสินค้า จำนวนเงิน และแนบหลักฐานสลิป
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
              <span className="font-semibold">เกิดข้อผิดพลาด:</span> {error}
            </div>
          )}

          {/* 1. Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1">
                <Calendar size={14} className="text-neutral-500" />
                วันที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1">
                <DollarSign size={14} className="text-neutral-500" />
                จำนวนเงิน (บาท) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-neutral-400 font-mono">
                  ฿
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-neutral-300 pl-8 pr-3 py-2 text-sm font-mono font-medium focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-right"
                />
              </div>
            </div>
          </div>

          {/* 2. Product Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1">
              <Package size={14} className="text-neutral-500" />
              สินค้า / รายการสิ่งของ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น กล่องพัสดุ เบอร์ 2A (100 กล่อง), สก็อตเทปใส, ค่าบริการอินเทอร์เน็ต"
              value={formData.product_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* 3. Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1">
              <FileText size={14} className="text-neutral-500" />
              รายละเอียด
            </label>
            <textarea
              rows={2}
              placeholder="รายละเอียดเพิ่มเติมของค่าใช้จ่าย..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* 4. Purchase Link */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1">
              <ExternalLink size={14} className="text-neutral-500" />
              ลิ้งรายการที่ซื้อ (Purchase Link)
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://shopee.co.th/... หรือ ลิงก์ร้านค้าที่สั่งซื้อ"
                value={formData.purchase_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_url: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 pr-10"
              />
              {formData.purchase_url && (
                <a
                  href={formData.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-800 p-0.5 rounded transition-colors"
                  title="ทดสอบเปิดลิงก์"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>

          {/* 5. Slip Image Upload */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1">
              <ImageIcon size={14} className="text-neutral-500" />
              สลิป / หลักฐานการจ่าย (แนบเป็นรูปภาพ)
            </label>

            {activePreview ? (
              <div className="relative flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePreview}
                    alt="Slip preview"
                    className="h-full w-full object-cover"
                  />
                  {isUploadingSlip && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-neutral-900 truncate">
                      {isUploadingSlip
                        ? "กำลังอัปโหลดรูปภาพ..."
                        : selectedFile
                          ? selectedFile.name
                          : "แนบรูปภาพสลิปแล้ว"}
                    </p>
                  </div>
                  <a
                    href={activePreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-0.5"
                  >
                    <ExternalLink size={12} />
                    ดูรูปภาพขนาดเต็ม
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSlip}
                  disabled={isUploadingSlip}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                  title="ลบรูปภาพสลิป"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 p-4 text-center cursor-pointer hover:border-neutral-500 hover:bg-neutral-50/50 transition-colors ${
                  isUploadingSlip ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                {isUploadingSlip ? (
                  <div className="flex flex-col items-center py-2">
                    <Loader2
                      size={24}
                      className="animate-spin text-neutral-600 mb-2"
                    />
                    <p className="text-xs text-neutral-600 font-medium">
                      กำลังอัปโหลดรูปภาพสลิป...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-full bg-neutral-100 p-2.5 text-neutral-500 mb-2">
                      <Upload size={18} />
                    </div>
                    <p className="text-xs font-medium text-neutral-700">
                      คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      รองรับไฟล์ภาพ .PNG, .JPG (ไม่เกิน 5 MB)
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 6. Collapsible Advanced Options */}
          <div className="border-t border-neutral-200 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <span>
                ตัวเลือกเพิ่มเติม (หมวดหมู่บัญชี / ช่องทาง / ร้านค้า /
                เลขที่บิล)
              </span>
              {showAdvanced ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 rounded-xl bg-neutral-50/80 p-3.5 border border-neutral-200 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      หมวดหมู่ค่าใช้จ่าย (ทางบัญชี)
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ExpenseCategory,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-neutral-900 focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      ช่องทาง / แผนก
                    </label>
                    <select
                      value={formData.channel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channel: e.target.value as ExpenseChannel,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-neutral-900 focus:outline-none"
                    >
                      {CHANNELS.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      ผู้รับเงิน / ร้านค้า (Vendor)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น TikTok Pte, แฟลช เอ็กซ์เพรส"
                      value={formData.vendor || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, vendor: e.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      เลขที่เอกสารอ้างอิง / ใบเสร็จ
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น INV-2026-001"
                      value={formData.invoice_ref || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoice_ref: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isLoading || isUploadingSlip}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploadingSlip}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {(isLoading || isUploadingSlip) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isUploadingSlip
                ? "กำลังอัปโหลดสลิป..."
                : initialData
                  ? "บันทึกการแก้ไข"
                  : "บันทึกค่าใช้จ่าย"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

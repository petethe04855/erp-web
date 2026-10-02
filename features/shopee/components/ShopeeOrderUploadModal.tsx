"use client";

import React, { useState } from "react";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shopeeApi } from "../api/shopee.api";
import type { OrderPreviewResult } from "../types/shopee.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeOrderUploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<OrderPreviewResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setSuccessMsg(null);
    setPreview(null);
    setShowDuplicateDetails(false);
    setLoadingPreview(true);

    try {
      const res = await shopeeApi.previewOrders(selected);
      setPreview(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse file preview";
      setError(msg);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const res = await shopeeApi.importOrders(file);
      let msg = `นำเข้าสำเร็จ: ${res.inserted_count} รายการ`;
      if (res.skipped_count > 0 || (res.duplicate_count && res.duplicate_count > 0)) {
        msg += ` (ข้ามข้อมูลซ้ำ ${res.skipped_count || res.duplicate_count} รายการ)`;
      }
      setSuccessMsg(msg);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import orders";
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              นำเข้าไฟล์คำสั่งซื้อ Shopee (Orders Export)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              รองรับไฟล์ .xlsx, .xls และ .csv จากระบบ Shopee Seller Centre พร้อมระบบตรวจสอบข้อมูลซ้ำ
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* File Upload Box */}
          {!preview && !loadingPreview && (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-8 hover:border-orange-500 hover:bg-orange-50/50 dark:border-zinc-700 dark:hover:border-orange-500 dark:hover:bg-orange-950/20">
              <Upload className="mb-3 h-10 w-10 text-orange-500" />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                ไฟล์ Shopee Orders (.xlsx, .xls, .csv)
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          {loadingPreview && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                กำลังอ่านและประมวลผลตัวอย่างข้อมูล...
              </span>
            </div>
          )}

          {/* Preview Details */}
          {preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="text-xs text-zinc-500">จำนวนแถวทั้งหมด</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {preview.total_rows.toLocaleString()} แถว
                  </div>
                </div>
                <div className="rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="text-xs text-zinc-500">จำนวนคำสั่งซื้อ (Orders)</div>
                  <div className="text-base font-bold text-orange-600 dark:text-orange-400">
                    {preview.total_orders.toLocaleString()} ออเดอร์
                  </div>
                </div>
                <div className="rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="text-xs text-zinc-500">รายการไม่มี SKU</div>
                  <div className={`text-base font-bold ${preview.blank_sku_count > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {preview.blank_sku_count} รายการ
                  </div>
                </div>
                <div className="rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="text-xs text-zinc-500">ข้อมูลซ้ำซ้อน (ตรวจพบ)</div>
                  <div className={`text-base font-bold ${(preview.duplicate_count || 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {(preview.duplicate_count || 0)} รายการ
                  </div>
                </div>
              </div>

              {/* Duplicate Alert Card if duplicates found */}
              {(preview.duplicate_count || 0) > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        พบข้อมูลซ้ำทั้งหมด {preview.duplicate_count} รายการ (ระบบจะข้ามรายการเหล่านี้อัตโนมัติ)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-amber-800 hover:bg-amber-200/50 dark:text-amber-200"
                      onClick={() => setShowDuplicateDetails(!showDuplicateDetails)}
                    >
                      {showDuplicateDetails ? "ซ่อนรายละเอียดข้อมูลซ้ำ" : "ดูชุดข้อมูลที่ซ้ำกัน"}
                    </Button>
                  </div>

                  {showDuplicateDetails && preview.duplicate_details && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-amber-200 bg-white p-2 dark:border-amber-900 dark:bg-zinc-900/90 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                      {preview.duplicate_details.map((dup, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                              {dup.identifier}
                            </span>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {dup.message}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] whitespace-nowrap ${
                              dup.duplicate_type === "DB_EXISTING"
                                ? "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950"
                                : "border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950"
                            }`}
                          >
                            {dup.duplicate_type === "DB_EXISTING" ? "มีในระบบแล้ว" : "ซ้ำในไฟล์"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sample Rows Table */}
              <div className="overflow-hidden rounded-lg border dark:border-zinc-800">
                <div className="bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  ตัวอย่างข้อมูลที่ตรวจพบ (แสดงสูงสุด 50 รายการแรก)
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      <tr className="border-b dark:border-zinc-800">
                        <th className="p-2">Order ID</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">ชื่อสินค้า</th>
                        <th className="p-2 text-center">จำนวน</th>
                        <th className="p-2 text-right">ยอดรวม (฿)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800">
                      {preview.sample_rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="p-2 font-mono">{row.order_id}</td>
                          <td className="p-2 font-mono font-medium text-orange-600 dark:text-orange-400">
                            {row.sku || <span className="text-zinc-400 italic">ว่าง</span>}
                          </td>
                          <td className="max-w-[200px] truncate p-2" title={row.product_name}>
                            {row.product_name}
                          </td>
                          <td className="p-2 text-center">{row.qty}</td>
                          <td className="p-2 text-right font-medium">{row.sale_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t px-6 py-4 dark:border-zinc-800">
          <div>
            {file && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <FileText className="h-4 w-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={importing}>
              ยกเลิก
            </Button>
            {preview && (
              <Button
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
              >
                {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ยืนยันนำเข้าข้อมูล
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

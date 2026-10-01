"use client";

import React, { useState } from "react";
import { Upload, X, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shopeeApi } from "../api/shopee.api";
import type { IncomePreviewResult } from "../types/shopee.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeIncomeUploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<IncomePreviewResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setSuccessMsg(null);
    setPreview(null);
    setLoadingPreview(true);

    try {
      const res = await shopeeApi.previewIncome(selected);
      setPreview(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse income preview";
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
      const res = await shopeeApi.importIncome(file);
      setSuccessMsg(
        `นำเข้าสำเร็จ: ${res.inserted_count} รายการ (ข้ามรายการซ้ำ ${res.skipped_count} รายการ) ยอดเงินรวม ฿${res.total_amount.toLocaleString(
          "th-TH",
          { minimumFractionDigits: 2 },
        )}`,
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import income";
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
              นำเข้าไฟล์รายงานการโอนเงิน Shopee (Income / Settlement Export)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              รองรับไฟล์ Excel ที่มีชีต &quot;Income&quot; หรือไฟล์ .csv จาก Shopee Seller Centre
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-8 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-zinc-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20">
              <Upload className="mb-3 h-10 w-10 text-emerald-500" />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                ไฟล์ Shopee Income (.xlsx, .xls, .csv ที่มีชีต &quot;Income&quot;)
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
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                กำลังอ่านและตรวจสอบชีต Income...
              </span>
            </div>
          )}

          {/* Preview Details */}
          {preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="text-xs text-zinc-500">จำนวนแถวทั้งหมด</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {preview.total_rows.toLocaleString()} แถว
                  </div>
                </div>
                <div className="rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="text-xs text-zinc-500">ยอดเงินโอนสุทธิรวม (Total Net Amount)</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ฿
                    {preview.total_net_amount.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              {/* Sample Rows Table */}
              <div className="overflow-hidden rounded-lg border dark:border-zinc-800">
                <div className="bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  ตัวอย่างข้อมูลที่ตรวจพบ (แสดงสูงสุด 50 รายการแรก)
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      <tr className="border-b dark:border-zinc-800">
                        <th className="p-2">Order ID</th>
                        <th className="p-2">วันที่สั่งซื้อ</th>
                        <th className="p-2">วันที่โอนเงินสำเร็จ</th>
                        <th className="p-2 text-right">ยอดเงินโอน (฿)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800">
                      {preview.sample_rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="p-2 font-mono font-medium">{row.order_id}</td>
                          <td className="p-2 text-zinc-500">
                            {row.order_date
                              ? new Date(row.order_date).toLocaleDateString("th-TH")
                              : "-"}
                          </td>
                          <td className="p-2 font-medium text-emerald-600 dark:text-emerald-400">
                            {row.transfer_date
                              ? new Date(row.transfer_date).toLocaleString("th-TH")
                              : "-"}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {row.net_amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                          </td>
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
                <span>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
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
                className="bg-emerald-600 text-white hover:bg-emerald-700"
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

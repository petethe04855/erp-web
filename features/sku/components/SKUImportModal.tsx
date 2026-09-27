"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import type { ImportXLSXResult } from "../types/sku";

interface SKUImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<ImportXLSXResult>;
  onDownloadTemplate: () => Promise<void>;
  isImporting?: boolean;
}

export function SKUImportModal({
  open,
  onOpenChange,
  onImport,
  onDownloadTemplate,
  isImporting,
}: SKUImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<ImportXLSXResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx")) {
        setErrorMsg("กรุณาเลือกไฟล์ Excel นามสกุล .xlsx เท่านั้น");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx")) {
        setErrorMsg("กรุณาเลือกไฟล์ Excel นามสกุล .xlsx เท่านั้น");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setErrorMsg(null);
    try {
      const res = await onImport(selectedFile);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการนำเข้าไฟล์";
      setErrorMsg(msg);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await onDownloadTemplate();
    } catch (err) {
      console.error(err);
      setErrorMsg("ไม่สามารถดาวน์โหลดไฟล์แม่แบบได้");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            นำเข้า SKU สินค้าจากไฟล์ Excel (.xlsx)
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            อัปโหลดไฟล์ตาราง Excel เพื่อเพิ่มหรืออัปเดตข้อมูลสินค้า SKU Master พร้อมกำหนดสต็อกเริ่มต้น
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template Download Guide Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                ไฟล์แม่แบบ Excel (.xlsx)
              </p>
              <p className="text-[11px] text-neutral-500">
                ใช้หัวตารางและรูปแบบข้อมูลตามที่ระบบกำหนดเพื่อความถูกต้อง
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-8 gap-1.5 text-xs font-medium shrink-0 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              ดาวน์โหลดแม่แบบ
            </Button>
          </div>

          {/* Drag & Drop File Zone */}
          {!result && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : selectedFile
                    ? "border-emerald-500 bg-emerald-50/20 dark:border-emerald-600/50"
                    : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-emerald-100 rounded-full dark:bg-emerald-950/50">
                      <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        ขนาด: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetState();
                      }}
                      className="h-7 text-xs text-neutral-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3 mr-1" /> เปลี่ยนไฟล์
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-neutral-100 rounded-full dark:bg-neutral-800">
                      <UploadCloud className="h-6 w-6 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        รองรับเฉพาะไฟล์ Excel (.xlsx) ขนาดไม่เกิน 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Import Result Summary */}
          {result && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium text-xs mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  การประมวลผลไฟล์เสร็จสมบูรณ์
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                    <div className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                      {result.totalRows}
                    </div>
                    <div className="text-[10px] text-neutral-500">ข้อมูลทั้งหมด</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {result.created}
                    </div>
                    <div className="text-[10px] text-neutral-500">สร้างใหม่</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                    <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {result.updated}
                    </div>
                    <div className="text-[10px] text-neutral-500">อัปเดต</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                    <div className={`text-base font-bold ${result.failed > 0 ? "text-red-600 dark:text-red-400" : "text-neutral-500"}`}>
                      {result.failed}
                    </div>
                    <div className="text-[10px] text-neutral-500">ผิดพลาด</div>
                  </div>
                </div>
              </div>

              {/* Error Rows Table if any */}
              {result.errors && result.errors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    รายการที่ไม่สามารถนำเข้าได้ ({result.errors.length}):
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 text-[11px] p-2 space-y-1">
                    {result.errors.map((e, idx) => (
                      <div key={idx} className="flex justify-between gap-2 border-b border-red-100 dark:border-red-950/50 pb-1 last:border-none last:pb-0">
                        <span className="font-mono text-neutral-700 dark:text-neutral-300">
                          แถวที่ {e.row} {e.sku ? `(${e.sku})` : ""}:
                        </span>
                        <span className="text-red-600 dark:text-red-400 text-right">
                          {e.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
          {result ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleClose}
              className="text-xs"
            >
              ปิดหน้าต่าง
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isImporting}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleUploadSubmit}
                disabled={!selectedFile || isImporting}
                className="gap-1.5 text-xs"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    กำลังนำเข้าข้อมูล...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    เริ่มนำเข้าข้อมูล
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

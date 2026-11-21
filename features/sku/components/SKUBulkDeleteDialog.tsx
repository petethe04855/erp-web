"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { SKU, BulkDeleteSKUResult } from "../types/sku";

interface SKUBulkDeleteDialogProps {
  open: boolean;
  skus: SKU[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (ids: number[]) => Promise<BulkDeleteSKUResult>;
  /** Called after a delete request finishes, so the table can clear its selection. */
  onDone?: (result: BulkDeleteSKUResult) => void;
}

/**
 * Confirms deleting several SKUs at once: lists every selected SKU before the
 * delete, then shows which were deleted and which the API refused (in use).
 */
export function SKUBulkDeleteDialog({ open, skus, onOpenChange, onConfirm, onDone }: SKUBulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<BulkDeleteSKUResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (isDeleting) return;
    setResult(null);
    setError(null);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await onConfirm(skus.map((s) => s.id));
      setResult(res);
      onDone?.(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const failed = result?.results.filter((r) => !r.deleted) ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent
        role="dialog"
        aria-modal="true"
        aria-labelledby="sku-bulk-delete-title"
        className="max-w-lg space-y-4 bg-white dark:bg-neutral-900"
      >
        {!result ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="sku-bulk-delete-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  ยืนยันการลบ SKU {skus.length} รายการ
                </h3>
                <p className="text-xs text-neutral-500">คุณต้องการลบข้อมูลสินค้าที่เลือกต่อไปนี้ออกจากระบบหรือไม่?</p>
              </div>
            </div>

            <ul className="max-h-64 divide-y divide-neutral-100 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 text-xs dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/50">
              {skus.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{s.sku}</span>
                  <span className="truncate text-right text-neutral-700 dark:text-neutral-300" title={s.name}>
                    {s.name}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-rose-600">
              การลบไม่สามารถย้อนกลับได้ — SKU ที่ยังมีสต็อกคงเหลือ มีประวัติการเคลื่อนไหว หรืออยู่ในเอกสาร (ออเดอร์, PO,
              ใบเสนอราคา, ชุด Bundle) จะลบไม่ได้และจะถูกข้าม แนะนำให้ปิดการใช้งาน (Inactive) แทน
            </p>

            {error && (
              <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                ลบไม่สำเร็จ: {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={isDeleting} onClick={close}>
                ยกเลิก
              </Button>
              <Button variant="destructive" size="sm" disabled={isDeleting || skus.length === 0} onClick={handleConfirm}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  `ยืนยันลบ ${skus.length} รายการ`
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 id="sku-bulk-delete-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              ผลการลบ SKU
            </h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> ลบสำเร็จ {result.deleted} รายการ
              </span>
              {result.failed > 0 && (
                <span className="inline-flex items-center gap-1 text-rose-600">
                  <XCircle className="h-4 w-4" /> ลบไม่ได้ {result.failed} รายการ
                </span>
              )}
            </div>

            {failed.length > 0 && (
              <ul className="max-h-64 divide-y divide-neutral-100 overflow-y-auto rounded-lg border border-rose-200 text-xs dark:divide-neutral-800 dark:border-rose-900">
                {failed.map((r) => (
                  <li key={r.id} className="space-y-0.5 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{r.sku || `#${r.id}`}</span>
                      <span className="truncate text-neutral-600 dark:text-neutral-400">{r.name}</span>
                    </div>
                    <div className="text-rose-600">{r.error}</div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={close}>
                ปิด
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

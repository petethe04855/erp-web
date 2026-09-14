"use client";

import React, { useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import { Trash2, Loader2, AlertTriangle, ImageIcon, Edit, SlidersHorizontal } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { SKU, StockAdjustmentDTO } from "../types/sku";
import type { ApiPaginationMeta } from "@/types/api";

interface SKUTableProps {
  skus: SKU[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
  onDelete?: (sku: string | number) => Promise<unknown>;
  onEdit?: (sku: SKU) => void;
  onAdjustStock?: (sku: SKU) => void;
  onSelectSKU?: (sku: SKU) => void;
}

interface SKUThumbnailProps {
  image?: string | null;
  name: string;
}

function SKUThumbnail({ image, name }: SKUThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="h-10 w-10 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900 flex items-center justify-center text-neutral-300 dark:text-neutral-600">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 flex items-center justify-center">
      <img
        src={getImageUrl(image)}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function SKUTable({
  skus,
  meta,
  isLoading,
  isError,
  onPageChange,
  onLimitChange,
  onRetry,
  onDelete,
  onEdit,
  onAdjustStock,
}: SKUTableProps) {
  const [deletingSku, setDeletingSku] = useState<SKU | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return <Loading message="กำลังโหลดข้อมูล SKU…" />;
  if (isError)
    return (
      <ErrorState
        message="โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ ERP API"
        onRetry={onRetry}
      />
    );

  const limit = meta.limit || 10;
  const totalPages =
    meta.totalPages && meta.totalPages > 0
      ? meta.totalPages
      : Math.max(1, Math.ceil(meta.total / limit));

  const handleDeleteConfirm = async () => {
    if (!deletingSku || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(deletingSku.sku || deletingSku.id);
      setDeletingSku(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className="border border-neutral-200 bg-white rounded-xl overflow-hidden shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            รายการ SKU ทั้งหมด
          </span>
          <span className="text-xs text-neutral-500">
            {meta.total.toLocaleString("th-TH")} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50/80 border-b border-neutral-200/80 dark:bg-neutral-900/50 dark:border-neutral-800">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left">
                  SKU
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left">
                  ชื่อสินค้า
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left w-56">
                  การใช้สต็อก (ใช้ไป / คงเหลือ)
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-right">
                  คงเหลือพร้อมขาย
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 whitespace-nowrap">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {skus.map((item) => {
                const onHandQty = item.onHand ?? item.stockQuantity ?? 0;
                const reservedQty = item.reserved ?? item.reservedStock ?? 0;
                const usedQty = item.usedQty ?? item.used ?? 0;
                const availableQty = item.available ?? Math.max(0, onHandQty - reservedQty);

                // Total stock handled = onHand + usedQty
                const totalCapacity = onHandQty + usedQty;
                // Percentage used from total capacity, or from onHand if capacity is 0
                const usedPct = totalCapacity > 0
                  ? Math.min(100, Math.round((usedQty / totalCapacity) * 100))
                  : 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    {/* SKU */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-left font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {item.sku}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-left text-neutral-800 dark:text-neutral-200">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>

                    {/* Stock Usage & Progress Bar */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-left">
                      <div className="flex flex-col gap-1 w-48">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-500 font-mono">
                            ใช้ไป {usedQty.toLocaleString("th-TH")} / คงเหลือ {onHandQty.toLocaleString("th-TH")}
                          </span>
                          <span
                            className={`font-semibold font-mono text-[11px] ${
                              usedPct >= 90
                                ? "text-rose-600 dark:text-rose-400"
                                : usedPct >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {usedPct}%
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              usedPct >= 90
                                ? "bg-rose-500"
                                : usedPct >= 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Available Stock */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right tabular-nums text-neutral-700 dark:text-neutral-300 font-medium">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-semibold ${
                            availableQty <= 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {availableQty.toLocaleString("th-TH")}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          (คงเหลือ {onHandQty.toLocaleString("th-TH")})
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {onAdjustStock && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/40 gap-1"
                            onClick={() => onAdjustStock(item)}
                            title="ปรับยอดสต็อกคงเหลือ"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span>ปรับยอด</span>
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-neutral-600 hover:text-primary hover:bg-neutral-50 border-neutral-200 dark:border-neutral-700 dark:text-neutral-300"
                            onClick={() => onEdit(item)}
                            title="แก้ไขข้อมูลสินค้า / รูปภาพ"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border-neutral-200 dark:border-neutral-700"
                            onClick={() => setDeletingSku(item)}
                            title="ลบ SKU สินค้า"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {skus.length === 0 && (
            <div className="text-center py-12 text-sm text-neutral-500">
              <p className="font-medium text-neutral-600 dark:text-neutral-400">
                ไม่พบข้อมูล SKU ตามเงื่อนไขนี้
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
          <Pagination
            currentPage={meta.page}
            totalPages={totalPages}
            totalItems={meta.total}
            limit={limit}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deletingSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  ยืนยันการลบ SKU สินค้า
                </h3>
                <p className="text-xs text-neutral-500">
                  คุณต้องการลบข้อมูลสินค้านี้ออกจากระบบหรือไม่?
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3 text-xs border border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 space-y-1">
              <div>
                <span className="text-neutral-500">รหัส SKU: </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {deletingSku.sku}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">ชื่อสินค้า: </span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {deletingSku.name}
                </span>
              </div>
            </div>

            <p className="text-xs text-rose-600">
              ⚠️ การลบ SKU จะลบรายการสินค้าและสต็อกคงเหลือที่เกี่ยวข้อง การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingSku(null)}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  "ยืนยันลบข้อมูล"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

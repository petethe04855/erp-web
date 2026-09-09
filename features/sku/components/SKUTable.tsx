"use client";

import React, { useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import type { SKU } from "../types/sku";
import type { ApiPaginationMeta } from "@/types/api";

interface SKUTableProps {
  skus: SKU[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
  onToggleStatus?: (sku: string | number, currentStatus: string) => Promise<unknown>;
  onDelete?: (sku: string | number) => Promise<unknown>;
  onSelectSKU?: (sku: SKU) => void;
}

export function SKUTable({
  skus,
  meta,
  isLoading,
  isError,
  onPageChange,
  onLimitChange,
  onRetry,
  onToggleStatus,
  onDelete,
}: SKUTableProps) {
  const [loadingSkuId, setLoadingSkuId] = useState<string | number | null>(null);
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

  const handleToggle = async (skuItem: SKU) => {
    if (!onToggleStatus) return;
    try {
      setLoadingSkuId(skuItem.id);
      await onToggleStatus(skuItem.sku || skuItem.id, skuItem.status);
    } catch (err: unknown) {
      alert("เปลี่ยนสถานะไม่สำเร็จ: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingSkuId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSku || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(deletingSku.sku || deletingSku.id);
      setDeletingSku(null);
    } catch (err: unknown) {
      alert("ลบข้อมูล SKU ไม่สำเร็จ: " + (err instanceof Error ? err.message : String(err)));
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
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left">
                  ประเภท
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-right">
                  ราคาขาย
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left">
                  สต็อก (พร้อมส่ง / จอง / ทั้งหมด)
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-center">
                  สถานะ (เปิด/ปิด)
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 whitespace-nowrap">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {skus.map((item) => {
                const isActive = item.status === "active";
                const isPending = loadingSkuId === item.id;

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
                      <div className="flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.isBundle && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-200 text-indigo-700 bg-indigo-50">
                            Bundle
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-left text-neutral-600 dark:text-neutral-400">
                      {item.category || "—"}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                      {new Intl.NumberFormat("th-TH", {
                        style: "currency",
                        currency: "THB",
                      }).format(Number(item.price || 0))}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-left text-neutral-700 dark:text-neutral-300">
                      {item.isBundle ? (
                        <span className="text-xs text-indigo-600 font-medium">ดูส่วนประกอบ</span>
                      ) : item.stockQuantity !== undefined ? (
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              พร้อมส่ง: {item.availableStock !== undefined ? item.availableStock : item.stockQuantity}
                            </span>
                            <span className="text-neutral-400 text-[11px]">
                              (รวม {item.stockQuantity})
                            </span>
                          </div>
                          {item.reservedStock !== undefined && item.reservedStock > 0 && (
                            <div className="inline-flex items-center gap-1">
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                                ติดจอง: {item.reservedStock} ชิ้น
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Status Switch Toggle */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2">
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                        ) : (
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggle(item)}
                            title={isActive ? "คลิกเพื่อปิดใช้งาน (Inactive)" : "คลิกเพื่อเปิดใช้งาน (Active)"}
                          />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            isActive ? "text-emerald-600" : "text-neutral-400"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <RecordDetails resource="products" id={item.sku} />
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border-neutral-200"
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

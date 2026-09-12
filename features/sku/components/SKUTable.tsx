"use client";

import React, { useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RecordDetails } from "@/features/erp/components/RecordDetails";
import { Trash2, Loader2, AlertTriangle, Package, ImageIcon, Edit, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
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
  onEdit?: (sku: SKU) => void;
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
  onToggleStatus,
  onDelete,
  onEdit,
}: SKUTableProps) {
  const [loadingSkuId, setLoadingSkuId] = useState<string | number | null>(null);
  const [deletingSku, setDeletingSku] = useState<SKU | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bundleViewingSku, setBundleViewingSku] = useState<SKU | null>(null);
  const [bundleComponents, setBundleComponents] = useState<Array<{
    id: number;
    bundleSku: string;
    componentSku: string;
    qty: number;
    note?: string;
  }> | null>(null);
  const [isLoadingBundle, setIsLoadingBundle] = useState(false);

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

  const handleOpenBundleComponents = async (item: SKU) => {
    setBundleViewingSku(item);
    setIsLoadingBundle(true);
    try {
      const { skuApi } = await import("../api/skuApi");
      const res = await skuApi.getBundleComponents(item.sku);
      setBundleComponents(res || []);
    } catch (err) {
      console.error(err);
      setBundleComponents([]);
    } finally {
      setIsLoadingBundle(false);
    }
  };

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
                <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left w-14">
                  รูปภาพ
                </th>
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
                    {/* Image Thumbnail */}
                    <td className="px-5 py-3 whitespace-nowrap text-left">
                      <SKUThumbnail image={item.image} name={item.name || item.sku} />
                    </td>

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
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              พร้อมขาย: {item.bundleAvailable ?? 0} ชุด
                            </span>
                            <span className="text-neutral-400 text-[10px]">(คำนวณจากสูตร)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenBundleComponents(item)}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium hover:underline cursor-pointer"
                          >
                            <Package className="h-3.5 w-3.5" />
                            ดูส่วนประกอบ
                          </button>
                        </div>
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
                          {item.accessories && item.accessories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {item.accessories.map((acc, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                  title={acc.name || acc.accessorySku}
                                >
                                  📦 ตัดเพิ่ม: {acc.accessorySku} ×{acc.quantity}
                                </span>
                              ))}
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
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-neutral-600 hover:text-primary hover:bg-neutral-50 border-neutral-200"
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

      {/* View Bundle Components Modal */}
      {bundleViewingSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    ส่วนประกอบสินค้า Bundle
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    {bundleViewingSku.sku}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-400 hover:text-neutral-600"
                onClick={() => setBundleViewingSku(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-neutral-600 dark:text-neutral-300">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {bundleViewingSku.name}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {isLoadingBundle ? (
                <div className="flex items-center justify-center p-6 text-xs text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  กำลังโหลดข้อมูลส่วนประกอบ...
                </div>
              ) : !bundleComponents || bundleComponents.length === 0 ? (
                <p className="text-center py-6 text-xs text-neutral-400 italic">
                  ไม่มีรายการส่วนประกอบสำหรับสินค้านี้
                </p>
              ) : (
                <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 dark:divide-neutral-800 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                  {bundleComponents.map((comp, idx) => (
                    <div
                      key={comp.id || idx}
                      className="flex items-center justify-between p-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                          {comp.componentSku}
                        </span>
                        {comp.note && (
                          <p className="text-[11px] text-neutral-400">
                            {comp.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="font-mono font-medium">
                          {comp.qty} ชิ้น
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBundleViewingSku(null)}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

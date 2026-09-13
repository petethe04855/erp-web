"use client";

import React from "react";
import { Pagination } from "@/components/common/Pagination";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, Edit, Trash2, Boxes, Plus } from "lucide-react";
import type { InventoryFormula } from "../types/formula";
import type { ApiPaginationMeta } from "@/types/api";

interface InventoryTableProps {
  formulas: InventoryFormula[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  togglingCode?: string | null;
  deletingCode?: string | null;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
  onView: (formula: InventoryFormula) => void;
  onEdit: (formula: InventoryFormula) => void;
  onToggleStatus: (formula: InventoryFormula) => void;
  onDelete: (formula: InventoryFormula) => void;
  onCreateNew: () => void;
}

export function InventoryTable({
  formulas,
  meta,
  isLoading,
  isError,
  togglingCode,
  deletingCode,
  onPageChange,
  onLimitChange,
  onRetry,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreateNew,
}: InventoryTableProps) {
  if (isLoading) return <Loading message="กำลังโหลดข้อมูลชุดสินค้า Inventory…" />;
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

  return (
    <section className="border border-neutral-200 bg-white rounded-xl overflow-hidden shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          รายการชุดสินค้าและสูตรตัดสต็อก (Inventory)
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
                รหัส Inventory
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left">
                ชื่อชุดสินค้า
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left">
                รายการวัตถุดิบ (SKU วัตถุดิบ)
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-right">
                พร้อมจัดส่ง (Available Sets)
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-center">
                สถานะ
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-left">
                วันที่แก้ไขล่าสุด
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 whitespace-nowrap">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {formulas.map((item) => {
              const formattedDate = item.updatedAt
                ? new Date(item.updatedAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              return (
                <tr
                  key={item.id || item.code}
                  className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Code */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-left font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {item.code}
                  </td>

                  {/* Name & Description */}
                  <td className="px-5 py-3.5 text-left text-neutral-800 dark:text-neutral-200">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {item.description && (
                        <span className="text-[11px] text-neutral-400 truncate max-w-xs">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Material Components */}
                  <td className="px-5 py-3.5 text-left text-neutral-700 dark:text-neutral-300">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                      {item.items && item.items.length > 0 ? (
                        <>
                          {item.items.slice(0, 3).map((comp, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="font-mono text-[11px] py-0.5 px-2 bg-slate-50 border-slate-200 text-slate-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                            >
                              {comp.componentSku} × {comp.qty}
                            </Badge>
                          ))}
                          {item.items.length > 3 && (
                            <span className="text-[11px] text-neutral-400 font-medium">
                              +{item.items.length - 3} วัตถุดิบ
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">ไม่มีวัตถุดิบ</span>
                      )}
                    </div>
                  </td>

                  {/* Available Sets */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-semibold">
                    <span
                      className={`text-sm ${
                        (item.availableSets ?? 0) > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-500"
                      }`}
                    >
                      {(item.availableSets ?? 0).toLocaleString("th-TH")}
                    </span>
                    <span className="text-xs text-neutral-400 ml-1">ชุด</span>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-2">
                      <Switch
                        checked={item.isActive}
                        disabled={togglingCode === item.code}
                        onCheckedChange={() => onToggleStatus(item)}
                      />
                      <span
                        className={`text-xs font-medium ${
                          item.isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-neutral-400"
                        }`}
                      >
                        {item.isActive ? "เปิด" : "ปิด"}
                      </span>
                    </div>
                  </td>

                  {/* Updated At */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-left text-xs text-neutral-500">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => onView(item)}
                        title="ดูรายละเอียด"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => onEdit(item)}
                        title="แก้ไขชุด Inventory"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deletingCode === item.code}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={() => onDelete(item)}
                        title="ลบชุด Inventory"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {formulas.length === 0 && (
          <div className="text-center py-16 text-sm text-neutral-500 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-3">
              <Boxes className="h-6 w-6" />
            </div>
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">
              ยังไม่มีข้อมูล Inventory
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              หน้านี้แสดงเฉพาะข้อมูล Inventory ที่คุณสร้างขึ้นเอง โดยเลือก SKU วัตถุดิบมาประกอบเป็นชุด
            </p>
            <Button
              size="sm"
              className="mt-4 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={onCreateNew}
            >
              <Plus className="h-3.5 w-3.5" />
              สร้างข้อมูล Inventory แรก
            </Button>
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
  );
}

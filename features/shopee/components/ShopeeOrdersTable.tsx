"use client";

import React, { useState } from "react";
import { Search, Calendar, Edit3, Trash2, ChevronLeft, ChevronRight, Package, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopeeSKUEditModal } from "./ShopeeSKUEditModal";
import { shopeeApi } from "../api/shopee.api";
import type { ShopeeOrder, ShopeeOrderItem } from "../types/shopee.types";
import type { ApiPaginationMeta } from "@/types/api";

interface Props {
  orders: ShopeeOrder[];
  meta?: ApiPaginationMeta;
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  search: string;
  setSearch: (s: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  onRefresh: () => void;
}

export function ShopeeOrdersTable({
  orders,
  meta,
  loading,
  page,
  setPage,
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onRefresh,
}: Props) {
  const [selectedItem, setSelectedItem] = useState<ShopeeOrderItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (orderId: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อ ${orderId}?`)) {
      return;
    }
    setDeletingId(orderId);
    try {
      await shopeeApi.deleteOrder(orderId);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSKU = (item: ShopeeOrderItem) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar - Matching ERP Dashboard Filter Style */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหา Order ID, SKU, ชื่อสินค้า, ผู้ซื้อ..."
            className="h-8 pl-8 text-xs font-normal"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800/80">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-[11px] text-neutral-500 font-medium">วันที่สั่งซื้อ:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-6 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
            />
            <span className="text-neutral-400">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-6 w-32 border-none p-0 text-xs font-semibold focus-visible:ring-0"
            />
          </div>

          {(search || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-neutral-500 hover:text-neutral-900"
              onClick={() => {
                setSearch("");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              ล้างตัวกรอง
            </Button>
          )}

          <div className="font-mono text-xs text-neutral-500 pl-2">
            {meta ? `${meta.total.toLocaleString()} ออเดอร์` : `${orders.length} ออเดอร์`}
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Order ID / วันที่สั่งซื้อ</th>
                <th className="px-4 py-3">ผู้ซื้อ / จังหวัด</th>
                <th className="px-4 py-3">รายการสินค้า & SKU</th>
                <th className="px-4 py-3 text-center">จำนวน</th>
                <th className="px-4 py-3 text-right">ยอดรวม (฿)</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      <span>กำลังโหลดรายการคำสั่งซื้อ...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Package className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                    <span>ไม่พบข้อมูลคำสั่งซื้อ Shopee ในช่วงที่เลือก</span>
                  </td>
                </tr>
              )}

              {!loading &&
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {ord.id}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {ord.order_date ? new Date(ord.order_date).toLocaleString("th-TH") : "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {ord.buyer_username || <span className="text-zinc-400 italic">ไม่ระบุ</span>}
                      </div>
                      <div className="text-xs text-zinc-500">{ord.province || "-"}</div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-2">
                        {ord.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-md bg-zinc-50 p-2 text-xs dark:bg-zinc-800/50"
                          >
                            <div className="flex-1">
                              <div className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                                {item.sku || <span className="text-red-500">ไม่มี SKU</span>}
                                {item.sku_confirmed && (
                                  <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-950/50 dark:text-emerald-300">
                                    ยืนยันแล้ว
                                  </Badge>
                                )}
                              </div>
                              <div className="line-clamp-1 text-zinc-600 dark:text-zinc-400">
                                {item.product_name}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-zinc-400 hover:text-orange-600"
                              onClick={() => handleEditSKU(item)}
                              title="แก้ไข SKU"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center align-top">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {ord.items?.reduce((sum, i) => sum + i.qty, 0)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100 align-top">
                      {ord.items
                        ?.reduce((sum, i) => sum + i.sale_price, 0)
                        .toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3 text-right align-top">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600"
                        onClick={() => handleDelete(ord.id)}
                        disabled={deletingId === ord.id}
                        title="ลบคำสั่งซื้อ"
                      >
                        {deletingId === ord.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.total > (meta.limit || 50) && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800">
            <div>
              แสดงหน้า {meta.page} จากทั้งหมด {meta.totalPages || Math.ceil(meta.total / (meta.limit || 50))} หน้า (ทั้งหมด{" "}
              {meta.total.toLocaleString()} รายการ)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={page >= (meta.totalPages || Math.ceil(meta.total / (meta.limit || 50)))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ShopeeSKUEditModal
        isOpen={isEditOpen}
        item={selectedItem}
        onClose={() => setIsEditOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}

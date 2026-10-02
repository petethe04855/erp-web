"use client";

import React, { useState } from "react";
import { Edit3, Trash2, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/common/Pagination";
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
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onRefresh: () => void;
}

export function ShopeeOrdersTable({
  orders,
  meta,
  loading,
  page,
  setPage,
  limit = 50,
  onLimitChange,
  onRefresh,
}: Props) {
  const [selectedItem, setSelectedItem] = useState<ShopeeOrderItem | null>(
    null,
  );
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

  const totalPages = meta
    ? meta.totalPages || Math.ceil(meta.total / (meta.limit || limit || 50))
    : 1;

  return (
    <div className="space-y-4">
      {/* Orders Table Container */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3">Order ID / วันที่สั่งซื้อ</th>
                <th className="px-4 py-3">ผู้ซื้อ / จังหวัด</th>
                <th className="px-4 py-3">รายการสินค้า & SKU</th>
                <th className="px-4 py-3 text-center">จำนวน</th>
                <th className="px-4 py-3 text-right">ยอดรวม (Line Sale)</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      <span>กำลังโหลดรายการคำสั่งซื้อ...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-neutral-500"
                  >
                    <Package className="mx-auto mb-2 h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                    <span>ไม่พบข้อมูลคำสั่งซื้อ Shopee ในช่วงที่เลือก</span>
                  </td>
                </tr>
              )}

              {!loading &&
                orders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {ord.id}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {ord.order_date
                          ? new Date(ord.order_date).toLocaleString("th-TH")
                          : "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        {ord.buyer_username || (
                          <span className="text-neutral-400 italic">
                            ไม่ระบุ
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {ord.province || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1.5">
                        {ord.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 p-2 text-xs border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/50"
                          >
                            <div className="flex-1">
                              <div className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                                {item.sku || (
                                  <span className="text-red-500">
                                    ไม่มี SKU
                                  </span>
                                )}
                                {item.sku_confirmed && (
                                  <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-950/50 dark:text-emerald-300">
                                    ยืนยันแล้ว
                                  </Badge>
                                )}
                              </div>
                              <div
                                className="line-clamp-1 text-neutral-600 dark:text-neutral-400 text-[11px]"
                                title={item.product_name}
                              >
                                {item.product_name}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[10px] text-neutral-500 hover:text-orange-600"
                              onClick={() => handleEditSKU(item)}
                            >
                              <Edit3 className="mr-1 h-3 w-3" />
                              แก้ไข SKU
                            </Button>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center align-top font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                      {ord.items?.reduce((acc, it) => acc + (it.qty || 1), 0)}
                    </td>

                    <td className="px-4 py-3 text-right align-top font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      ฿
                      {ord.items
                        ?.reduce((acc, it) => acc + it.sale_price, 0)
                        .toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </td>

                    <td className="px-4 py-3 text-right align-top">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-red-600"
                        disabled={deletingId === ord.id}
                        onClick={() => handleDelete(ord.id)}
                        title="ลบคำสั่งซื้อ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total > 0 && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 p-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={meta.total}
              limit={limit || meta.limit || 50}
              limitOptions={[10, 20, 50, 100]}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                onLimitChange?.(newLimit);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* SKU Edit Modal */}
      <ShopeeSKUEditModal
        isOpen={isEditOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
}

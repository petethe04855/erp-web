"use client";

import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatThaiDateTime } from "@/lib/utils";
import { useSKUReceiptsQuery } from "../queries/skuQueries";
import { Loader2, RefreshCw, Inbox, FileText, Calendar, Building2, Package } from "lucide-react";
import type { SKUReceiptHistory } from "../types/sku";

interface SKUReceiptHistoryRowProps {
  skuId: number;
  skuCode: string;
  isExpanded: boolean;
  colSpan?: number;
}

export function SKUReceiptHistoryRow({
  skuId,
  skuCode,
  isExpanded,
  colSpan = 8,
}: SKUReceiptHistoryRowProps) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError, error, refetch, isFetching } = useSKUReceiptsQuery(
    skuId,
    { page, limit },
    { enabled: isExpanded }
  );

  if (!isExpanded) return null;

  const receipts: SKUReceiptHistory[] = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 5, total: 0 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const getSourceBadge = (type: string) => {
    switch (type) {
      case "GOODS_RECEIVE":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[11px] font-normal"
          >
            Goods Receive
          </Badge>
        );
      case "INITIAL_STOCK":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 text-[11px] font-normal"
          >
            Initial Stock
          </Badge>
        );
      case "STOCK_ADJUSTMENT_IN":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800 text-[11px] font-normal"
          >
            Adjustment IN
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px] font-normal">
            {type}
          </Badge>
        );
    }
  };

  return (
    <TableRow className="bg-neutral-50/60 dark:bg-neutral-900/60 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/80 border-b border-neutral-200/80 dark:border-neutral-800">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="py-3 px-6 space-y-3">
          {/* Subheader */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                <Inbox className="h-3.5 w-3.5 text-primary" />
                ประวัติสินค้าเข้าสต็อก ({skuCode})
              </span>
              {meta.total > 0 && (
                <span className="text-xs text-neutral-400">
                  ทั้งหมด {meta.total} รายการ
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 gap-1"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              <RefreshCw
                className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`}
              />
              <span>รีเฟรช</span>
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-6 text-xs text-neutral-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>กำลังโหลดประวัติรับเข้าสินค้า...</span>
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-5 text-xs text-rose-600 gap-2 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900">
              <p>เกิดข้อผิดพลาดในการโหลดประวัติรับเข้า: {(error as Error)?.message || "กรุณาลองใหม่อีกครั้ง"}</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-100"
                onClick={() => refetch()}
              >
                ลองใหม่
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && receipts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-neutral-400 text-xs gap-1 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-white/50 dark:bg-neutral-900/50">
              <Package className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
              <p className="font-medium text-neutral-600 dark:text-neutral-400">
                ยังไม่มีประวัติรับสินค้าเข้าสต็อก
              </p>
              <p className="text-[11px] text-neutral-400">
                รายการจะปรากฏเมื่อมีการรับสินค้าผ่าน Goods Receive, Initial Stock หรือ Stock Adjustment IN
              </p>
            </div>
          )}

          {/* Subtable */}
          {!isLoading && !isError && receipts.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-medium border-b border-neutral-200/70 dark:border-neutral-800">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">วันที่รับเข้า</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">ประเภท</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">จำนวนเข้า</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">คลังสินค้า</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Lot / ผู้ผลิต</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">วันหมดอายุ</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">เอกสารอ้างอิง</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {receipts.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* วันที่รับเข้า */}
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-neutral-700 dark:text-neutral-300">
                        {formatThaiDateTime(item.receivedAt)}
                      </td>

                      {/* ประเภท */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        {getSourceBadge(item.sourceType)}
                      </td>

                      {/* จำนวนเข้า */}
                      <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        +{item.quantity.toLocaleString("th-TH")}
                      </td>

                      {/* คลังสินค้า */}
                      <td className="py-2 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                        {item.warehouseName || `คลัง #${item.warehouseId}`}
                      </td>

                      {/* Lot */}
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-neutral-700 dark:text-neutral-300">
                        {item.lotNumber ? (
                          <div className="flex flex-col">
                            <span>{item.lotNumber}</span>
                            {item.supplierLot && (
                              <span className="text-[10px] text-neutral-400">
                                ผู้ผลิต: {item.supplierLot}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>

                      {/* วันหมดอายุ */}
                      <td className="py-2 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                        {item.expiryDate
                          ? formatThaiDateTime(item.expiryDate, { includeTime: false })
                          : "-"}
                      </td>

                      {/* เอกสารอ้างอิง */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex flex-col font-mono text-[11px]">
                          {item.referenceId ? (
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                              {item.referenceId}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                          {item.purchaseOrderRef && (
                            <span className="text-[10px] text-neutral-500">
                              PO: {item.purchaseOrderRef}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* หมายเหตุ */}
                      <td className="py-2 px-3 text-neutral-500 max-w-xs truncate" title={item.note || ""}>
                        {item.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtable Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 bg-neutral-50/40 dark:bg-neutral-900/40">
                  <span>
                    หน้า {page} จาก {totalPages} ({meta.total} รายการ)
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ก่อนหน้า
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      ถัดไป
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

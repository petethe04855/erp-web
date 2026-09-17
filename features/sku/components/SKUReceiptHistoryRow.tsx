"use client";

import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatThaiDateTime } from "@/lib/utils";
import { useSKUReceiptsQuery, useSKUMovementsQuery } from "../queries/skuQueries";
import {
  Loader2,
  RefreshCw,
  Inbox,
  ArrowUpRight,
  Package,
  Layers,
  ArrowDownRight,
} from "lucide-react";
import type { SKUReceiptHistory, SKUMovement } from "../types/sku";

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
  const [activeTab, setActiveTab] = useState<"receipts" | "usage">("receipts");
  const [receiptPage, setReceiptPage] = useState(1);
  const [usagePage, setUsagePage] = useState(1);
  const limit = 5;

  // Query 1: ประวัติรับเข้าสต็อก (เรียงเข้าก่อนอยู่บนสุด)
  const {
    data: receiptData,
    isLoading: isReceiptLoading,
    isError: isReceiptError,
    error: receiptError,
    refetch: refetchReceipts,
    isFetching: isReceiptFetching,
  } = useSKUReceiptsQuery(
    skuId,
    { page: receiptPage, limit },
    { enabled: isExpanded && activeTab === "receipts" }
  );

  // Query 2: ประวัติการขายหรือดึงไปใช้ (OUT movements)
  const {
    data: movementData,
    isLoading: isMovementLoading,
    isError: isMovementError,
    error: movementError,
    refetch: refetchMovements,
    isFetching: isMovementFetching,
  } = useSKUMovementsQuery(
    skuId,
    { page: usagePage, limit },
    { enabled: isExpanded && activeTab === "usage" }
  );

  if (!isExpanded) return null;

  const receipts: SKUReceiptHistory[] = receiptData?.data || [];
  const receiptMeta = receiptData?.meta || { page: 1, limit: 5, total: 0 };
  const receiptTotalPages = Math.max(1, Math.ceil((receiptMeta.total || 0) / limit));

  // Filter for OUT movements (การขาย/ดึงไปใช้)
  const rawMovements: SKUMovement[] = movementData?.data || [];
  const outMovements = rawMovements.filter((m) => m.type === "OUT");
  const usageMeta = movementData?.meta || { page: 1, limit: 5, total: 0 };
  const usageTotalPages = Math.max(1, Math.ceil((usageMeta.total || 0) / limit));

  const isLoading = activeTab === "receipts" ? isReceiptLoading : isMovementLoading;
  const isFetching = activeTab === "receipts" ? isReceiptFetching : isMovementFetching;
  const isError = activeTab === "receipts" ? isReceiptError : isMovementError;
  const currentError = activeTab === "receipts" ? receiptError : movementError;
  const handleRefetch = () => {
    if (activeTab === "receipts") refetchReceipts();
    else refetchMovements();
  };

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

  const getChannelBadge = (channel?: string, refType?: string) => {
    const ch = (channel || refType || "").toUpperCase();
    if (ch.includes("TIKTOK")) {
      return (
        <Badge
          variant="outline"
          className="bg-black/5 text-neutral-800 border-neutral-300 dark:bg-white/10 dark:text-neutral-200 text-[10px]"
        >
          TikTok Shop
        </Badge>
      );
    }
    if (ch.includes("ORDER")) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 text-[10px]"
        >
          Order Sale
        </Badge>
      );
    }
    if (ch.includes("ADJUST")) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 text-[10px]"
        >
          Adjust OUT
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px]">
        {channel || refType || "OUT"}
      </Badge>
    );
  };

  return (
    <TableRow className="bg-neutral-50/60 dark:bg-neutral-900/60 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/80 border-b border-neutral-200/80 dark:border-neutral-800">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="py-3 px-6 space-y-3">
          {/* Header & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Tab Switcher */}
              <div className="inline-flex rounded-lg bg-neutral-200/70 dark:bg-neutral-800 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("receipts")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "receipts"
                      ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  <Inbox className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>ประวัติรับเข้าสต็อก (เข้าก่อนอยู่บนสุด)</span>
                  {receiptMeta.total > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                      {receiptMeta.total}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("usage")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "usage"
                      ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span>ประวัติการขาย / ดึงไปใช้ (ระบุ Lot)</span>
                  {usageMeta.total > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono">
                      {usageMeta.total}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                SKU: {skuCode}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 gap-1"
              onClick={handleRefetch}
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
              <span>
                {activeTab === "receipts"
                  ? "กำลังโหลดประวัติรับเข้าสินค้า..."
                  : "กำลังโหลดประวัติการเบิก/ขาย..."}
              </span>
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-5 text-xs text-rose-600 gap-2 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900">
              <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {(currentError as Error)?.message || "กรุณาลองใหม่อีกครั้ง"}</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-100"
                onClick={handleRefetch}
              >
                ลองใหม่
              </Button>
            </div>
          )}

          {/* TAB 1: ประวัติรับเข้า (Receipts) */}
          {activeTab === "receipts" && !isLoading && !isError && (
            <>
              {receipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-neutral-400 text-xs gap-1 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-white/50 dark:bg-neutral-900/50">
                  <Package className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                  <p className="font-medium text-neutral-600 dark:text-neutral-400">
                    ยังไม่มีประวัติรับสินค้าเข้าสต็อก
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    รายการจะปรากฏเมื่อมีการรับสินค้าผ่าน Goods Receive, Initial Stock หรือ Stock Adjustment IN
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-medium border-b border-neutral-200/70 dark:border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">ลำดับ (เก่าไปใหม่)</th>
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
                      {receipts.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="py-2 px-3 whitespace-nowrap font-mono text-neutral-400">
                            #{(receiptPage - 1) * limit + idx + 1}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap font-mono text-neutral-700 dark:text-neutral-300">
                            {formatThaiDateTime(item.receivedAt)}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            {getSourceBadge(item.sourceType)}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            +{item.quantity.toLocaleString("th-TH")}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                            {item.warehouseName || `คลัง #${item.warehouseId}`}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap font-mono text-neutral-700 dark:text-neutral-300">
                            {item.lotNumber ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-primary">{item.lotNumber}</span>
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
                          <td className="py-2 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                            {item.expiryDate
                              ? formatThaiDateTime(item.expiryDate, { includeTime: false })
                              : "-"}
                          </td>
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
                          <td className="py-2 px-3 text-neutral-500 max-w-xs truncate" title={item.note || ""}>
                            {item.note || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {receiptTotalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 bg-neutral-50/40 dark:bg-neutral-900/40">
                      <span>
                        หน้า {receiptPage} จาก {receiptTotalPages} ({receiptMeta.total} รายการ)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          disabled={receiptPage <= 1}
                          onClick={() => setReceiptPage((p) => Math.max(1, p - 1))}
                        >
                          ก่อนหน้า
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          disabled={receiptPage >= receiptTotalPages}
                          onClick={() => setReceiptPage((p) => p + 1)}
                        >
                          ถัดไป
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: ประวัติการขาย / ดึงไปใช้ (Usage / OUT Movements) */}
          {activeTab === "usage" && !isLoading && !isError && (
            <>
              {outMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-neutral-400 text-xs gap-1 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-white/50 dark:bg-neutral-900/50">
                  <ArrowUpRight className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                  <p className="font-medium text-neutral-600 dark:text-neutral-400">
                    ยังไม่มีประวัติการขายหรือดึงไปใช้สำหรับสินค้านี้
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    เมื่อมีการจัดส่งออเดอร์ ขอยืม เบิกจ่าย หรือตัดสต็อก ข้อมูลและ Lot ที่ถูกดึงจะปรากฏที่นี่
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-medium border-b border-neutral-200/70 dark:border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">วันที่ดึงใช้/ขาย</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">ช่องทาง/ประเภท</th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right">จำนวนที่ตัด</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Lot ที่ใช้</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">คลังสินค้า</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">เลขอ้างอิง / ออเดอร์</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {outMovements.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          {/* วันที่ */}
                          <td className="py-2 px-3 whitespace-nowrap font-mono text-neutral-700 dark:text-neutral-300">
                            {formatThaiDateTime(item.created_at)}
                          </td>

                          {/* ช่องทาง */}
                          <td className="py-2 px-3 whitespace-nowrap">
                            {getChannelBadge(item.channel, item.reference_type)}
                          </td>

                          {/* จำนวนที่ตัด (-) */}
                          <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                            -{Math.abs(item.quantity).toLocaleString("th-TH")}
                          </td>

                          {/* Lot ที่ใช้ */}
                          <td className="py-2 px-3 whitespace-nowrap font-mono">
                            {item.lot_number ? (
                              <div className="inline-flex flex-col">
                                <span className="font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                  {item.lot_number}
                                </span>
                                {item.supplier_lot && (
                                  <span className="text-[10px] text-neutral-400 mt-0.5">
                                    ผู้ผลิต: {item.supplier_lot}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">สต็อกทั่วไป (ไม่ระบุ Lot)</span>
                            )}
                          </td>

                          {/* คลัง */}
                          <td className="py-2 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                            {item.warehouse_id === 1 ? "คลังหลัก" : `คลัง #${item.warehouse_id}`}
                          </td>

                          {/* เอกสารอ้างอิง */}
                          <td className="py-2 px-3 whitespace-nowrap font-mono">
                            {item.reference_id ? (
                              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                {item.reference_id}
                              </span>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>

                          {/* หมายเหตุ */}
                          <td className="py-2 px-3 text-neutral-500 max-w-xs truncate" title={item.note || ""}>
                            {item.note || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {usageTotalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 bg-neutral-50/40 dark:bg-neutral-900/40">
                      <span>
                        หน้า {usagePage} จาก {usageTotalPages} ({usageMeta.total} รายการ)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          disabled={usagePage <= 1}
                          onClick={() => setUsagePage((p) => Math.max(1, p - 1))}
                        >
                          ก่อนหน้า
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          disabled={usagePage >= usageTotalPages}
                          onClick={() => setUsagePage((p) => p + 1)}
                        >
                          ถัดไป
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

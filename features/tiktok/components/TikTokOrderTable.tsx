"use client";

import React from "react";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Package } from "lucide-react";
import type { TikTokOrder } from "../types/tiktok";

interface TikTokOrderTableProps {
  orders: TikTokOrder[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  AWAITING_SHIPMENT: { label: "รอจัดส่ง", variant: "secondary" },
  AWAITING_COLLECTION: { label: "รอขนส่งรับ", variant: "secondary" },
  IN_TRANSIT: { label: "กำลังจัดส่ง", variant: "outline" },
  DELIVERED: { label: "จัดส่งแล้ว", variant: "default" },
  COMPLETED: { label: "สำเร็จ", variant: "default" },
  CANCELLED: { label: "ยกเลิก", variant: "destructive" },
  UNPAID: { label: "ยังไม่ชำระ", variant: "outline" },
};

export function TikTokOrderTable({
  orders,
  isLoading,
  isError,
  onRetry,
}: TikTokOrderTableProps) {
  if (isLoading) return <Loading message="กำลังโหลดคำสั่งซื้อ TikTok Shop…" />;
  if (isError)
    return (
      <ErrorState
        message="โหลดคำสั่งซื้อ TikTok ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อกับ ERP API"
        onRetry={onRetry}
      />
    );

  const formatBaht = (amount: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime())
      ? dateStr
      : d.toLocaleString("th-TH", {
          dateStyle: "short",
          timeStyle: "short",
        });
  };

  return (
    <section className="border border-neutral-200 bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
        <div>
          <span className="text-sm font-semibold text-neutral-800">
            คำสั่งซื้อทั้งหมด ({orders.length.toLocaleString("th-TH")})
          </span>
          <p className="text-xs text-neutral-500 mt-0.5">
            ข้อมูลออเดอร์พร้อมสถานะการตัดสต็อกสินค้าในคลัง ERP
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500">
            <tr>
              <th className="px-5 py-3 text-left">คำสั่งซื้อ / เวลา</th>
              <th className="px-5 py-3 text-left">ผู้ซื้อ / ผู้รับ</th>
              <th className="px-5 py-3 text-left">สินค้าและจำนวน</th>
              <th className="px-5 py-3 text-right">ยอดรวม</th>
              <th className="px-5 py-3 text-center">การตัดสต็อก ERP</th>
              <th className="px-5 py-3 text-center">สถานะ TikTok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((order) => {
              const statusCfg = STATUS_LABELS[order.orderStatus] || {
                label: order.orderStatus,
                variant: "outline" as const,
              };

              return (
                <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                  {/* Order ID & Time */}
                  <td className="px-5 py-4 align-top whitespace-nowrap">
                    <div className="font-mono text-xs font-semibold text-neutral-900">
                      {order.tiktokOrderId}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {formatDate(order.orderCreatedAt || order.paidTime)}
                    </div>
                  </td>

                  {/* Buyer */}
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-neutral-800 text-xs">
                      {order.recipientName || "ลูกค้า TikTok"}
                    </div>
                    {order.recipientPhone && (
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {order.recipientPhone}
                      </div>
                    )}
                  </td>

                  {/* Items */}
                  <td className="px-5 py-4 align-top">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-1.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <Package className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-neutral-800">
                                {it.productName || it.sellerSku || "สินค้า TikTok"}
                              </span>
                              <div className="text-[11px] text-neutral-400 font-mono">
                                SKU: {it.erpSku || it.sellerSku || "—"} × {it.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>

                  {/* Total Amount */}
                  <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                    <span className="font-semibold text-neutral-900 text-xs">
                      {formatBaht(order.totalAmount)}
                    </span>
                  </td>

                  {/* Stock Deduction Status */}
                  <td className="px-5 py-4 align-top text-center whitespace-nowrap">
                    {order.stockDeducted || order.stockDeductionStatus === "DEDUCTED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        ตัดสต็อกแล้ว
                      </span>
                    ) : order.stockDeductionStatus === "FAILED" ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200"
                        title={order.stockDeductionError || "สินค้าไม่พอตัดสต็อก"}
                      >
                        <XCircle className="h-3 w-3" />
                        ตัดสต็อกไม่สำเร็จ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        รอดำเนินการ
                      </span>
                    )}
                  </td>

                  {/* TikTok Order Status */}
                  <td className="px-5 py-4 align-top text-center whitespace-nowrap">
                    <Badge variant={statusCfg.variant} className="text-[11px]">
                      {statusCfg.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-12 text-sm text-neutral-400">
            ไม่พบรายการคำสั่งซื้อ TikTok Shop ตามเงื่อนไขการค้นหา
          </div>
        )}
      </div>
    </section>
  );
}

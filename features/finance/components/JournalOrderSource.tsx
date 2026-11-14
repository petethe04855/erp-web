"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Loader2, ShoppingCart, User as UserIcon } from "lucide-react";
import { money, thaiDate } from "@/features/orders/types/order";
import type { JournalEntry } from "../types/finance";
import { useJournalSourceOrder } from "../queries/useJournalSourceQueries";

/**
 * Shows the sales order behind a `sales_delivery` journal entry (the order whose
 * shipment was posted). Read-only summary + a deep link to the order list.
 */
export function JournalOrderSource({ entry }: { entry: JournalEntry }) {
  const code = entry.source_ref;
  const { data: order, isLoading, isError } = useJournalSourceOrder(code);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 text-xs text-neutral-500">
        <Loader2 size={14} className="animate-spin" /> กำลังโหลดเอกสารใบสั่งขาย {code}...
      </div>
    );
  }
  if (isError || !order) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 p-3 text-xs text-neutral-500">
        ไม่พบเอกสารใบสั่งขาย {code}
      </div>
    );
  }

  const skus = Array.from(new Set((entry.lines || []).map((l) => l.sku).filter(Boolean)));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          <ShoppingCart size={15} className="text-neutral-500" />
          เอกสารต้นทาง: ใบสั่งขาย {order.orderNumber}
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 border border-neutral-200">
            {order.fulfillmentStatus}
          </span>
        </h3>
        <Link
          href={`/orders?search=${encodeURIComponent(order.orderNumber)}`}
          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <ExternalLink size={12} />
          เปิดใบสั่งขาย
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
        <dt className="flex items-center gap-1 text-neutral-500">
          <UserIcon size={12} /> ลูกค้า
        </dt>
        <dd className="font-medium text-neutral-900 truncate" title={order.customerName}>
          {order.customerName || "-"}
        </dd>
        <dt className="text-neutral-500">วันที่สั่ง</dt>
        <dd className="text-neutral-800">{thaiDate(order.orderDate)}</dd>
        <dt className="text-neutral-500">ช่องทาง</dt>
        <dd className="text-neutral-800">{order.channel || "-"}</dd>
        <dt className="text-neutral-500">จำนวนรายการ</dt>
        <dd className="text-neutral-800">{order.itemsCount ?? 0} รายการ</dd>
        <dt className="text-neutral-500">ยอดรวม</dt>
        <dd className="font-mono font-semibold text-neutral-900">{money(order.totalAmount)}</dd>
      </dl>

      {skus.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-2 text-xs">
          <span className="text-neutral-500">SKU ที่ลงบัญชี:</span>
          {skus.map((sku) => (
            <span
              key={sku}
              className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] text-neutral-700"
            >
              {sku}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

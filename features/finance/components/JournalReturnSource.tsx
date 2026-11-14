"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Loader2, PackageCheck, RotateCcw, User as UserIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { JournalEntry } from "../types/finance";
import { useJournalSourceReturn } from "../queries/useJournalSourceQueries";

/**
 * Shows the sales return behind a `sales_return` / `sales_return_stock` journal
 * entry, including the evidence photos attached to its lines.
 */
export function JournalReturnSource({ entry }: { entry: JournalEntry }) {
  const code = entry.source_ref;
  const { data: ret, isLoading, isError } = useJournalSourceReturn(code);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 text-xs text-neutral-500">
        <Loader2 size={14} className="animate-spin" /> กำลังโหลดเอกสารใบรับคืน {code}...
      </div>
    );
  }
  if (isError || !ret) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 p-3 text-xs text-neutral-500">
        ไม่พบเอกสารใบรับคืน {code}
      </div>
    );
  }

  const evidence = Array.from(
    new Set((ret.lines || []).flatMap((line) => line.evidence_images || [])),
  );

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          <RotateCcw size={15} className="text-neutral-500" />
          เอกสารต้นทาง: ใบรับคืน {ret.return_no}
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 border border-neutral-200">
            {ret.status}
          </span>
        </h3>
        <Link
          href={`/returns?search=${encodeURIComponent(ret.return_no)}`}
          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <ExternalLink size={12} />
          เปิดใบรับคืน
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
        <dt className="flex items-center gap-1 text-neutral-500">
          <UserIcon size={12} /> ลูกค้า
        </dt>
        <dd className="font-medium text-neutral-900 truncate" title={ret.customer_name}>
          {ret.customer_name || "-"}
        </dd>
        <dt className="flex items-center gap-1 text-neutral-500">
          <PackageCheck size={12} /> ประเภท
        </dt>
        <dd className="text-neutral-800">
          {ret.return_type === "CUSTOMER" ? "ลูกค้าคืน" : "คืนภายใน"}
        </dd>
        <dt className="text-neutral-500">ออเดอร์ต้นทาง</dt>
        <dd className="font-mono text-neutral-800">{ret.order_no || "-"}</dd>
        <dt className="text-neutral-500">วันที่รับคืน</dt>
        <dd className="text-neutral-800">{ret.return_date?.substring(0, 10) || "-"}</dd>
        <dt className="text-neutral-500">จำนวนที่คืน</dt>
        <dd className="text-neutral-800">{ret.total_qty} ชิ้น</dd>
        <dt className="text-neutral-500">ยอดเงินคืน</dt>
        <dd className="font-mono font-semibold text-neutral-900">
          ฿{Number(ret.net_amount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
        </dd>
      </dl>

      {ret.reason && (
        <p className="mt-2 border-t border-neutral-100 pt-2 text-xs text-neutral-600">
          <span className="font-semibold text-neutral-700">สาเหตุ: </span>
          {ret.reason}
        </p>
      )}

      {evidence.length > 0 && (
        <div className="mt-3 border-t border-neutral-100 pt-2">
          <p className="mb-1.5 text-xs text-neutral-500">
            หลักฐาน/เอกสารแนบ ({evidence.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {evidence.map((url) => (
              <a
                key={url}
                href={getImageUrl(url)}
                target="_blank"
                rel="noreferrer"
                title="เปิดรูปเต็ม (แท็บใหม่)"
                className="block h-14 w-14 overflow-hidden rounded-md border border-neutral-200 hover:border-emerald-500 hover:shadow-sm transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(url)}
                  alt="หลักฐานสภาพสินค้า"
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Store, User as UserIcon, Receipt } from "lucide-react";
import { useExpenseByCode } from "../queries/useFinanceQueries";
import { isExpenseVoided } from "../types/finance";
import { SlipThumb } from "./SlipThumb";
import { SlipPreviewModal } from "./SlipPreviewModal";

/**
 * Shows the source expense of an expense journal entry: uploader, vendor,
 * amount, status and the payment slip, with a link to the expense record.
 */
export function JournalExpenseSource({ code }: { code: string }) {
  const { data: exp, isLoading, isError } = useExpenseByCode(code);
  const [showSlip, setShowSlip] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 text-xs text-neutral-500">
        <Loader2 size={14} className="animate-spin" /> กำลังโหลดเอกสารค่าใช้จ่าย {code}...
      </div>
    );
  }
  if (isError || !exp) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 p-3 text-xs text-neutral-500">
        ไม่พบเอกสารค่าใช้จ่าย {code}
      </div>
    );
  }

  const voided = isExpenseVoided(exp);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          <Receipt size={15} className="text-neutral-500" />
          เอกสารต้นทาง: {exp.code}
          {voided ? (
            <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 border border-red-200">
              ยกเลิกแล้ว
            </span>
          ) : (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
              Active
            </span>
          )}
        </h3>
        <Link
          href={`/finance/expenses?search=${encodeURIComponent(exp.code)}`}
          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <ExternalLink size={12} />
          เปิดใบค่าใช้จ่าย
        </Link>
      </div>

      <div className="flex gap-4">
        {exp.slip_url ? (
          <button
            type="button"
            onClick={() => setShowSlip(true)}
            className="flex-shrink-0 rounded-lg border border-neutral-200 p-1 hover:border-emerald-500 hover:shadow-sm transition-all"
            title="คลิกเพื่อดูรูปสลิปขนาดเต็ม"
          >
            <SlipThumb url={exp.slip_url} className="h-20 w-20" />
          </button>
        ) : (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-200 text-[10px] text-neutral-400">
            ไม่มีสลิป
          </div>
        )}

        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <dt className="flex items-center gap-1 text-neutral-500">
            <UserIcon size={12} /> ผู้บันทึก
          </dt>
          <dd className="font-medium text-neutral-900 truncate" title={exp.created_by}>{exp.created_by || "-"}</dd>
          <dt className="flex items-center gap-1 text-neutral-500">
            <Store size={12} /> ร้านค้า
          </dt>
          <dd className="text-neutral-800 truncate">{exp.vendor || "-"}</dd>
          <dt className="text-neutral-500">สินค้า / รายการ</dt>
          <dd className="text-neutral-800 truncate" title={exp.product_name}>{exp.product_name || "-"}</dd>
          <dt className="text-neutral-500">เลขที่บิล</dt>
          <dd className="text-neutral-800">{exp.invoice_ref || "-"}</dd>
          <dt className="text-neutral-500">ยอดปัจจุบัน</dt>
          <dd className={`font-mono font-semibold ${voided ? "line-through text-neutral-400" : "text-neutral-900"}`}>
            ฿{exp.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </dd>
          {voided && (
            <>
              <dt className="text-neutral-500">ยกเลิกโดย</dt>
              <dd className="text-neutral-800 truncate">
                {exp.voided_by || "-"}
                {exp.void_reason ? ` • ${exp.void_reason}` : ""}
              </dd>
            </>
          )}
        </dl>
      </div>

      {showSlip && exp.slip_url && (
        <SlipPreviewModal
          isOpen={true}
          imageUrl={exp.slip_url}
          title={`สลิปค่าใช้จ่าย ${exp.code}`}
          onClose={() => setShowSlip(false)}
        />
      )}
    </div>
  );
}

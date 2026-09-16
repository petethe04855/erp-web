"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PackageCheck,
  Ban,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownLeft,
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { SalesReturn } from "../types/return";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnDoc: SalesReturn | null;
  onSubmit: (id: number) => Promise<unknown>;
  onApprove: (id: number) => Promise<unknown>;
  onReject: (id: number, reason: string) => Promise<unknown>;
  onCancel: (id: number, reason: string) => Promise<unknown>;
  onOpenCompleteModal: () => void;
}

export function ReturnDetailModal({
  open,
  onOpenChange,
  returnDoc,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
  onOpenCompleteModal,
}: Props) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!returnDoc) return null;

  const handleAction = async (actionFn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await actionFn();
      setShowRejectInput(false);
      setRejectReason("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        role="dialog"
        aria-modal="true"
        aria-label="รายละเอียดใบรับคืนสินค้า"
        className="max-h-[90vh] overflow-y-auto max-w-2xl"
      >
        <div className="flex items-start justify-between border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-bold text-neutral-900">
                {returnDoc.return_no}
              </DialogTitle>
              <Badge variant="outline" className="text-xs">
                {returnDoc.status}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-neutral-500 mt-1">
              สร้างเมื่อ:{" "}
              {returnDoc.created_at ? new Date(returnDoc.created_at).toLocaleString("th-TH") : "-"}
            </DialogDescription>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 text-xs border-b">
          <div>
            <span className="text-neutral-500 block">ประเภทการคืน</span>
            <span className="font-semibold text-neutral-900">
              {returnDoc.return_type === "CUSTOMER" ? "ลูกค้าคืน" : "คืนภายใน"}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">ออเดอร์ต้นทาง</span>
            <span className="font-semibold text-neutral-900">
              {returnDoc.order_no || "-"}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">ลูกค้า</span>
            <span className="font-semibold text-neutral-900">
              {returnDoc.customer_name || "-"}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">วันที่รับคืน</span>
            <span className="font-semibold text-neutral-900">
              {returnDoc.return_date ? returnDoc.return_date.substring(0, 10) : "-"}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">ผู้สร้างเอกสาร</span>
            <span className="font-semibold text-neutral-900">
              {returnDoc.created_by || "-"}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block">ผู้อนุมัติ</span>
            <span className="font-semibold text-neutral-900">
              {returnDoc.approved_by || "-"}
            </span>
          </div>
        </div>

        {/* Lines */}
        <div className="space-y-2 py-2">
          <span className="text-xs font-bold text-neutral-900 block">
            รายการสินค้า ({returnDoc.lines?.length || 0})
          </span>
          <div className="divide-y border rounded-lg bg-neutral-50/50">
            {returnDoc.lines?.map((line, idx) => (
              <div key={line.id || idx} className="p-3 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-neutral-900">{line.sku}</div>
                  <div className="text-neutral-500">{line.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    สภาพ: <span className="font-medium text-neutral-700">{line.condition}</span>
                    {line.restock ? (
                      <span className="ml-2 text-emerald-600 font-semibold">
                        • นำเข้าสต็อก
                      </span>
                    ) : (
                      <span className="ml-2 text-amber-600">
                        • ไม่นำเข้าสต็อก
                      </span>
                    )}
                  </div>
                  {/* รูปถ่ายยืนยันสภาพสินค้า */}
                  {(line.evidence_images?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {line.evidence_images!.map((url) => (
                        <a
                          key={url}
                          href={getImageUrl(url)}
                          target="_blank"
                          rel="noreferrer"
                          title="เปิดรูปเต็ม (แท็บใหม่)"
                          className="w-12 h-12 rounded-md overflow-hidden border border-neutral-200 block"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageUrl(url)}
                            alt="หลักฐานสภาพสินค้า"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-900">
                    {line.quantity} ชิ้น
                  </div>
                  <div className="text-neutral-500">
                    ฿{Number(line.line_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-1 pt-1 text-xs">
            <span className="text-neutral-500">รวมจำนวน: {returnDoc.total_qty} ชิ้น</span>
            <span className="text-sm font-bold text-neutral-900">
              ยอดเงินคืน: ฿{Number(returnDoc.net_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Reason / Note */}
        {(returnDoc.reason || returnDoc.note || returnDoc.cancellation_reason) && (
          <div className="rounded-lg bg-neutral-100 p-3 text-xs space-y-1">
            {returnDoc.reason && (
              <div>
                <span className="font-semibold text-neutral-700">สาเหตุ: </span>
                <span className="text-neutral-600">{returnDoc.reason}</span>
              </div>
            )}
            {returnDoc.note && (
              <div>
                <span className="font-semibold text-neutral-700">หมายเหตุ: </span>
                <span className="text-neutral-600">{returnDoc.note}</span>
              </div>
            )}
            {returnDoc.cancellation_reason && (
              <div>
                <span className="font-semibold text-rose-600">เหตุผลปฏิเสธ/ยกเลิก: </span>
                <span className="text-rose-700">{returnDoc.cancellation_reason}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions bar */}
        <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            {showRejectInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="ระบุเหตุผลที่ปฏิเสธ..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="text-xs h-8 px-2 border rounded"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy || !rejectReason.trim()}
                  onClick={() => handleAction(() => onReject(returnDoc.id, rejectReason))}
                >
                  ยืนยันปฏิเสธ
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRejectInput(false)}
                >
                  ยกเลิก
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {returnDoc.status === "DRAFT" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => handleAction(() => onCancel(returnDoc.id, "ยกเลิกโดยผู้สร้าง"))}
                >
                  <Ban className="mr-1.5 h-3.5 w-3.5" />
                  ยกเลิกเอกสาร
                </Button>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => handleAction(() => onSubmit(returnDoc.id))}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  ส่งอนุมัติ (Submit)
                </Button>
              </>
            )}

            {returnDoc.status === "SUBMITTED" && !showRejectInput && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  disabled={busy}
                  onClick={() => setShowRejectInput(true)}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  ปฏิเสธ (Reject)
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={busy}
                  onClick={() => handleAction(() => onApprove(returnDoc.id))}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  อนุมัติ (Approve)
                </Button>
              </>
            )}

            {returnDoc.status === "APPROVED" && (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={busy}
                onClick={onOpenCompleteModal}
              >
                <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                ตรวจรับสินค้า (Complete)
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ปิด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

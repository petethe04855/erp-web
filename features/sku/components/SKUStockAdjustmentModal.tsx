"use client";

import React, { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import type { SKU, StockAdjustmentDTO } from "../types/sku";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSKU: SKU | null;
  onSubmit: (dto: StockAdjustmentDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function SKUStockAdjustmentModal({
  open,
  onOpenChange,
  selectedSKU,
  onSubmit,
  isSubmitting,
}: Props) {
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");

  const currentQty = selectedSKU?.onHand ?? selectedSKU?.stockQuantity ?? 0;
  const reservedQty = selectedSKU?.reserved ?? selectedSKU?.reservedStock ?? 0;

  useEffect(() => {
    if (open && selectedSKU) {
      setQty(String(currentQty));
      setReason("ปรับยอดสต็อกประจำรอบ");
    } else {
      setQty("");
      setReason("");
    }
  }, [open, selectedSKU, currentQty]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="ปรับยอดสต็อกสินค้า"
      description={`รหัส SKU: ${selectedSKU?.sku || ""} (${selectedSKU?.name || ""})`}
      isSubmitting={isSubmitting}
      onSubmit={async () => {
        if (!selectedSKU) throw new Error("กรุณาเลือกสินค้า");
        await onSubmit({
          sku: selectedSKU.sku,
          warehouse: "1",
          type: "adjustment",
          quantity: Number(qty) || 0,
          reason: reason || "ปรับยอดสต็อก",
        });
        onOpenChange(false);
      }}
    >
      <div className="space-y-3">
        <div className="rounded-lg bg-neutral-50 p-3 text-xs border border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-neutral-500">ยอดคงเหลือปัจจุบันในระบบ:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {currentQty.toLocaleString("th-TH")} ชิ้น
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">ยอดที่ใช้ไปแล้ว (จ่ายออก/ขาย):</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">
              {(selectedSKU?.usedQty ?? selectedSKU?.used ?? 0).toLocaleString("th-TH")} ชิ้น
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">ยอดที่ถูกจองไว้:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {reservedQty.toLocaleString("th-TH")} ชิ้น
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">ยอดพร้อมขาย (Available):</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {(selectedSKU?.available ?? currentQty - reservedQty).toLocaleString("th-TH")} ชิ้น
            </span>
          </div>
        </div>

        <label className="block text-xs font-medium">
          จำนวนที่นับได้จริง (ยอดคงเหลือใหม่)
          <Input
            className="mt-1.5"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min={reservedQty}
            step="1"
            required
          />
          <span className="text-[11px] text-neutral-400 mt-1 block">
            ยอดนับจริงต้องไม่ต่ำกว่ายอดที่ถูกจอง ({reservedQty} ชิ้น)
          </span>
        </label>

        <label className="block text-xs font-medium">
          เหตุผลในการปรับยอด
          <Input
            className="mt-1.5"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="เช่น ตรวจนับสต็อกประจำสัปดาห์ / สินค้าชำรุด"
            required
          />
        </label>

        <p className="text-xs text-neutral-500">
          ระบบจะบันทึกผลต่างลงในประวัติความเคลื่อนไหวสต็อก (Stock Movement) โดยอัตโนมัติ
        </p>
      </div>
    </FormDialog>
  );
}

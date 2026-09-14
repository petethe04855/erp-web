"use client";

import React, { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Select } from "@/components/ui/select";
import type {
  SalesReturn,
  CompleteReturnDTO,
  ItemCondition,
} from "../types/return";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnDoc: SalesReturn | null;
  onComplete: (dto: CompleteReturnDTO) => Promise<unknown>;
}

export function ReturnCompleteModal({
  open,
  onOpenChange,
  returnDoc,
  onComplete,
}: Props) {
  const [lines, setLines] = useState<
    Array<{
      line_id: number;
      sku: string;
      name: string;
      quantity: number;
      condition: ItemCondition;
      restock: boolean;
    }>
  >([]);

  useEffect(() => {
    if (returnDoc && returnDoc.lines) {
      setLines(
        returnDoc.lines.map((l) => ({
          line_id: l.id || 0,
          sku: l.sku,
          name: l.name,
          quantity: l.quantity,
          condition: l.condition || "GOOD",
          restock: l.restock ?? (l.condition === "GOOD"),
        })),
      );
    }
  }, [returnDoc]);

  const updateLine = (index: number, patch: Partial<(typeof lines)[0]>) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const next = { ...l, ...patch };
        if (next.condition !== "GOOD") {
          next.restock = false;
        }
        return next;
      }),
    );
  };

  const handleSubmit = async () => {
    await onComplete({
      lines: lines.map((l) => ({
        line_id: l.line_id,
        condition: l.condition,
        restock: l.restock,
      })),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`ยืนยันการตรวจรับสินค้า: ${returnDoc?.return_no || ""}`}
      description="คลังสินค้าตรวจสอบสภาพสินค้าจริงก่อนรับเข้าคลัง สินค้าสภาพดีจะเพิ่มยอดคงเหลือในระบบทันที"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div
              key={line.line_id || idx}
              className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{line.sku}</span>
                  <span className="text-neutral-500 ml-2">{line.name}</span>
                </div>
                <span className="font-bold text-neutral-900">
                  รับคืน: {line.quantity} ชิ้น
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-600 block mb-1">
                    ผลการตรวจสภาพ
                  </span>
                  <Select
                    className="h-8 text-xs bg-white"
                    value={line.condition}
                    onChange={(e) =>
                      updateLine(idx, {
                        condition: e.target.value as ItemCondition,
                      })
                    }
                  >
                    <option value="GOOD">สภาพดี (GOOD)</option>
                    <option value="DAMAGED">ชำรุด / เสียหาย (DAMAGED)</option>
                    <option value="EXPIRED">หมดอายุ (EXPIRED)</option>
                    <option value="WRONG_ITEM">สินค้าส่งผิด (WRONG_ITEM)</option>
                  </Select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-700 h-8">
                    <input
                      type="checkbox"
                      checked={line.restock}
                      disabled={line.condition !== "GOOD"}
                      onChange={(e) =>
                        updateLine(idx, { restock: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span>
                      นำกลับเข้าสต็อกพร้อมขาย (Restock)
                      {line.condition !== "GOOD" && (
                        <span className="text-rose-500 block text-[10px]">
                          (สินค้าไม่สมบูรณ์ ไม่สามารถนำกลับเข้าขายได้)
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FormDialog>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, ImagePlus, X, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { uploadEvidenceImage } from "../api/returnApi";
import { useOrderListQuery } from "@/features/orders/queries/orderQueries";
import { useOrderReturnableQuery } from "../queries/returnQueries";
import type {
  CreateReturnDTO,
  ReturnType,
  ItemCondition,
  ReasonCode,
} from "../types/return";

/** สภาพสินค้าที่นำกลับเข้าสต็อกพร้อมขายได้ (ส่งผิด = ตัวสินค้ายังสมบูรณ์) */
const isRestockable = (condition: ItemCondition) =>
  condition === "GOOD" || condition === "WRONG_ITEM";

/** สาเหตุการคืนถูกกำหนดโดยอัตโนมัติจากสภาพสินค้า */
const REASON_BY_CONDITION: Record<ItemCondition, ReasonCode> = {
  GOOD: "CUSTOMER_CHANGE",
  DAMAGED: "DEFECT",
  EXPIRED: "DEFECT",
  WRONG_ITEM: "WRONG_ITEM",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateReturnDTO) => Promise<unknown>;
}

export function ReturnFormModal({ open, onOpenChange, onSubmit }: Props) {
  const [returnType, setReturnType] = useState<ReturnType>("CUSTOMER");
  const [selectedOrderID, setSelectedOrderID] = useState<number | undefined>(undefined);
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<
    Array<{
      sku: string;
      name: string;
      orderedQty: number;
      returnedQtySoFar: number;
      returnableQty: number;
      quantity: number;
      unitPrice: number;
      condition: ItemCondition;
      reasonCode: ReasonCode;
      evidenceImages: string[];
      uploading: boolean;
    }>
  >([]);

  // Fetch shipped orders for CUSTOMER returns
  const { data: ordersData, isLoading: ordersLoading } = useOrderListQuery({
    fulfillmentStatus: "SHIPPED",
    limit: 100,
  });

  const shippedOrders = ordersData?.data || [];

  // Fetch returnable items when an order is selected
  const { data: returnableItems = [], isLoading: returnableLoading } =
    useOrderReturnableQuery(selectedOrderID);

  // When order changes, populate lines with returnable items that have returnableQty > 0
  useEffect(() => {
    if (!selectedOrderID) {
      setLines((prev) => (prev.length > 0 ? [] : prev));
      return;
    }

    if (returnableItems && returnableItems.length > 0) {
      setLines(
        returnableItems
          .filter((item) => item.returnable_qty > 0)
          .map((item) => ({
            sku: item.sku,
            name: item.name,
            orderedQty: item.ordered_qty,
            returnedQtySoFar: item.returned_qty_so_far,
            returnableQty: item.returnable_qty,
            quantity: 1,
            unitPrice: item.unit_price,
            condition: "GOOD" as ItemCondition,
            reasonCode: "CUSTOMER_CHANGE" as ReasonCode,
            evidenceImages: [],
            uploading: false,
          })),
      );
    }
  }, [selectedOrderID, returnableItems]);

  const updateLine = (index: number, patch: Partial<(typeof lines)[0]>) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const updated = { ...line, ...patch };
        // สาเหตุการคืน และการเข้าสต็อก ถูกกำหนดจากสภาพสินค้าโดยอัตโนมัติ:
        // GOOD / WRONG_ITEM → เข้าสต็อก, DAMAGED / EXPIRED → ไม่เข้าสต็อก
        if (patch.condition && patch.condition !== line.condition) {
          updated.reasonCode = REASON_BY_CONDITION[patch.condition];
        }
        return updated;
      }),
    );
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  /** เลือกไฟล์รูปยืนยัน → ตรวจนามสกุล/ขนาด → อัปโหลดผ่าน API กลาง */
  const handleEvidenceFileSelect = async (index: number, file: File) => {
    if (!"image/png,image/jpeg".split(",").includes(file.type)) {
      alert("อนุญาตเฉพาะรูปภาพประเภท PNG หรือ JPG เท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์รูปภาพเกินกำหนด (ต้องไม่เกิน 5 MB)");
      return;
    }
    updateLine(index, { uploading: true });
    try {
      const url = await uploadEvidenceImage(file);
      updateLine(index, {
        uploading: false,
        evidenceImages: [...lines[index].evidenceImages, url],
      });
    } catch (err) {
      updateLine(index, { uploading: false });
      alert(err instanceof Error ? err.message : "อัปโหลดรูปภาพไม่สำเร็จ");
    }
  };

  const removeEvidenceImage = (index: number, url: string) => {
    const line = lines[index];
    if (!line) return;
    updateLine(index, {
      evidenceImages: line.evidenceImages.filter((x) => x !== url),
    });
  };

  const totalReturnQty = lines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
  const totalReturnAmount = lines.reduce(
    (acc, l) => acc + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0),
    0,
  );

  const handleSubmit = async () => {
    if (returnType === "CUSTOMER" && !selectedOrderID) {
      throw new Error("กรุณาเลือกคำสั่งซื้อ (Order)");
    }
    if (lines.length === 0) {
      throw new Error("กรุณาระบุรายการสินค้าที่ต้องการรับคืนอย่างน้อย 1 รายการ");
    }

    for (const l of lines) {
      if (l.quantity <= 0) {
        throw new Error(`จำนวนคืนของ ${l.sku} ต้องมากกว่า 0`);
      }
      if (returnType === "CUSTOMER" && l.quantity > l.returnableQty) {
        throw new Error(
          `จำนวนคืนของ ${l.sku} (${l.quantity} ชิ้น) เกินจำนวนที่สามารถคืนได้ (${l.returnableQty} ชิ้น)`,
        );
      }
      // รูปยืนยันบังคับสำหรับสินค้าเสียหาย/หมดอายุ (backend ตรวจซ้ำอีกชั้น)
      if (!isRestockable(l.condition) && l.evidenceImages.length === 0) {
        throw new Error(
          `สินค้า ${l.sku} มีสภาพเสียหาย/หมดอายุ กรุณาแนบรูปถ่ายยืนยันอย่างน้อย 1 รูป`,
        );
      }
    }

    const payload: CreateReturnDTO = {
      return_type: returnType,
      order_id: returnType === "CUSTOMER" ? selectedOrderID : undefined,
      warehouse_id: 1,
      return_date: returnDate,
      reason,
      note,
      lines: lines.map((l) => ({
        sku: l.sku,
        quantity: l.quantity,
        condition: l.condition,
        restock: isRestockable(l.condition),
        reason_code: l.reasonCode,
        evidence_images: l.evidenceImages.length > 0 ? l.evidenceImages : undefined,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="สร้างใบรับคืนสินค้า (New Sales Return)"
      description="ระบุประเภทการคืน เลือกคำสั่งซื้อที่จัดส่งแล้ว และตรวจสอบจำนวนสินค้าที่ต้องการรับคืน"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            ประเภทการรับคืน <span className="text-rose-500">*</span>
            <Select
              className="mt-1.5 text-xs"
              value={returnType}
              onChange={(e) => {
                const val = e.target.value as ReturnType;
                setReturnType(val);
                if (val === "INTERNAL") {
                  setSelectedOrderID(undefined);
                  setLines([]);
                }
              }}
            >
              <option value="CUSTOMER">ลูกค้าคืน (จากคำสั่งซื้อ SHIPPED)</option>
              <option value="INTERNAL">คืนภายใน / คืนเข้าคลัง</option>
            </Select>
          </label>

          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            วันที่รับคืน <span className="text-rose-500">*</span>
            <Input
              type="date"
              className="mt-1.5 text-xs"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </label>
        </div>

        {returnType === "CUSTOMER" && (
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              เลือกคำสั่งซื้อ (SHIPPED Orders) <span className="text-rose-500">*</span>
              <Select
                className="mt-1.5 text-xs"
                value={selectedOrderID ? String(selectedOrderID) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedOrderID(val ? Number(val) : undefined);
                }}
              >
                <option value="">-- กรุณาเลือกคำสั่งซื้อ --</option>
                {shippedOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} · {o.customerName} (฿{Number(o.totalAmount || 0).toLocaleString()})
                  </option>
                ))}
              </Select>
            </label>
            {ordersLoading && (
              <span className="text-[11px] text-neutral-400 mt-1 block">
                กำลังโหลดรายการคำสั่งซื้อ...
              </span>
            )}
          </div>
        )}

        {/* Lines table */}
        <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-xs font-bold text-neutral-900">
              รายการสินค้าที่ขอรับคืน ({lines.length})
            </span>
            {returnableLoading && (
              <span className="text-xs text-neutral-500">
                กำลังตรวจสอบยอดคืนได้...
              </span>
            )}
          </div>

          {lines.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400">
              {returnType === "CUSTOMER"
                ? "กรุณาเลือกคำสั่งซื้อเพื่อโหลดรายการสินค้าที่สามารถรับคืนได้"
                : "ไม่มีรายการสินค้า"}
            </div>
          ) : (
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div
                  key={`${line.sku}-${i}`}
                  className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-neutral-900">
                        {line.sku}
                      </span>
                      <span className="text-neutral-500 ml-2 font-medium">
                        {line.name}
                      </span>
                      {line.orderedQty > 0 && (
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          สั่งไป: {line.orderedQty} ชิ้น · คืนแล้ว: {line.returnedQtySoFar} ชิ้น · คืนได้สูงสุด:{" "}
                          <span className="font-semibold text-emerald-600">
                            {line.returnableQty} ชิ้น
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-rose-600 h-7 w-7 p-0"
                      onClick={() => removeLine(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-600 block mb-1">
                        จำนวนขอคืน
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={returnType === "CUSTOMER" ? line.returnableQty : undefined}
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(i, { quantity: Math.max(1, Number(e.target.value)) })
                        }
                        className="h-8 text-xs bg-white"
                        required
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-neutral-600 block mb-1">
                        สภาพสินค้า
                      </span>
                      <Select
                        className="h-8 text-xs bg-white"
                        value={line.condition}
                        onChange={(e) =>
                          updateLine(i, {
                            condition: e.target.value as ItemCondition,
                          })
                        }
                      >
                        <option value="GOOD">สภาพดี (GOOD)</option>
                        <option value="DAMAGED">เสียหาย (DAMAGED)</option>
                        <option value="EXPIRED">หมดอายุ (EXPIRED)</option>
                        <option value="WRONG_ITEM">ส่งผิด (WRONG_ITEM)</option>
                      </Select>
                    </div>
                  </div>

                  {/* สรุปผลจากสภาพสินค้าโดยอัตโนมัติ */}
                  <div className="text-[11px] flex items-center gap-1.5 pt-0.5">
                    {isRestockable(line.condition) ? (
                      <span className="text-emerald-600 font-medium">
                        ✓ จะรับเข้าสต็อกอัตโนมัติเมื่อตรวจรับ
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">
                        ✕ สินค้าเสียหาย/หมดอายุ — จะไม่นำกลับเข้าสต็อก
                      </span>
                    )}
                  </div>

                  {/* รูปถ่ายยืนยันสภาพสินค้า (บังคับเมื่อเสียหาย/หมดอายุ) */}
                  <div className="pt-1 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-neutral-600">
                        รูปถ่ายยืนยันสภาพสินค้า
                        {!isRestockable(line.condition) && (
                          <span className="text-rose-500"> * (บังคับ)</span>
                        )}
                      </span>
                      <label
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border cursor-pointer transition-colors ${
                          line.uploading
                            ? "opacity-50 cursor-not-allowed border-neutral-200 text-neutral-400"
                            : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {line.uploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ImagePlus className="h-3 w-3" />
                        )}
                        {line.uploading ? "กำลังอัปโหลด..." : "เพิ่มรูป"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          disabled={line.uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = ""; // เลือกไฟล์เดิมซ้ำได้
                            if (file) void handleEvidenceFileSelect(i, file);
                          }}
                        />
                      </label>
                    </div>

                    {line.evidenceImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {line.evidenceImages.map((url) => (
                          <div
                            key={url}
                            className="relative w-14 h-14 rounded-md overflow-hidden border border-neutral-200 group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getImageUrl(url)}
                              alt="หลักฐานสภาพสินค้า"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              aria-label="ลบรูป"
                              className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeEvidenceImage(i, url)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {lines.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <span className="text-xs text-neutral-500">
                รวมทั้งหมด {totalReturnQty} ชิ้น
              </span>
              <span className="text-sm font-bold text-neutral-900">
                ยอดเงินคืน: ฿
                {totalReturnAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            เหตุผลการคืน (สรุป)
            <Input
              className="mt-1.5 text-xs"
              placeholder="เช่น ลูกค้าขอเปลี่ยนไซส์, สินค้าไม่ตรงปก"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>

          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            หมายเหตุภายใน
            <Input
              className="mt-1.5 text-xs"
              placeholder="บันทึกข้อความภายใน"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </div>
    </FormDialog>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useOrderListQuery } from "@/features/orders/queries/orderQueries";
import { useOrderReturnableQuery } from "../queries/returnQueries";
import type {
  CreateReturnDTO,
  CreateReturnLineDTO,
  ReturnType,
  ItemCondition,
  ReasonCode,
} from "../types/return";

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
      restock: boolean;
      reasonCode: ReasonCode;
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
            restock: true,
            reasonCode: "CUSTOMER_CHANGE" as ReasonCode,
          })),
      );
    }
  }, [selectedOrderID, returnableItems]);

  const updateLine = (index: number, patch: Partial<(typeof lines)[0]>) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const updated = { ...line, ...patch };
        // Enforce business rule: if condition != GOOD, restock must be false
        if (updated.condition !== "GOOD") {
          updated.restock = false;
        }
        return updated;
      }),
    );
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
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
        restock: l.restock,
        reason_code: l.reasonCode,
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
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

                    <div>
                      <span className="text-[10px] font-semibold text-neutral-600 block mb-1">
                        สาเหตุการคืน
                      </span>
                      <Select
                        className="h-8 text-xs bg-white"
                        value={line.reasonCode}
                        onChange={(e) =>
                          updateLine(i, {
                            reasonCode: e.target.value as ReasonCode,
                          })
                        }
                      >
                        <option value="CUSTOMER_CHANGE">ลูกค้าเปลี่ยนใจ</option>
                        <option value="DEFECT">สินค้าชำรุด/มีตำหนิ</option>
                        <option value="LATE_DELIVERY">ส่งช้าเกินกำหนด</option>
                        <option value="WRONG_ITEM">ส่งผิดรายการ/สี/ไซส์</option>
                        <option value="OTHER">อื่นๆ</option>
                      </Select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-neutral-700 h-8">
                        <input
                          type="checkbox"
                          checked={line.restock}
                          disabled={line.condition !== "GOOD"}
                          onChange={(e) =>
                            updateLine(i, { restock: e.target.checked })
                          }
                          className="h-3.5 w-3.5 rounded border-neutral-300 text-primary focus:ring-primary"
                        />
                        <span>รับเข้าสต็อก (Restock)</span>
                      </label>
                    </div>
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

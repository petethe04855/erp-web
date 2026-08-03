"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

type FinishedProduct = { sku: string; name: string; type: string; isActive: boolean };
type ReceiveLine = {
  sku: string;
  qtyReceived: number;
  lot: string;
  expiryDate: string;
  landedUnitCost: number;
};

interface ReceiveGoodsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: FinishedProduct[];
  onSubmit: (data: {
    receiveDate: string;
    items: ReceiveLine[];
  }) => boolean;
  showToast: (msg: string) => void;
}

const emptyLine = (): ReceiveLine => ({
  sku: "", qtyReceived: 0, lot: "", expiryDate: "", landedUnitCost: 0,
});

export function ReceiveGoodsSheet({
  open, onOpenChange, products, onSubmit, showToast,
}: ReceiveGoodsSheetProps) {
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<ReceiveLine[]>([emptyLine()]);

  function updateLine<K extends keyof ReceiveLine>(index: number, field: K, value: ReceiveLine[K]) {
    setLines((current) => current.map((line, i) => i === index ? { ...line, [field]: value } : line));
  }

  function handleSubmit() {
    const items = lines.filter((line) => line.sku || line.qtyReceived || line.lot);
    if (!receiveDate || items.length === 0) {
      showToast("กรุณาระบุวันที่รับและสินค้าอย่างน้อย 1 รายการ");
      return;
    }
    if (items.some((line) => !line.sku || line.qtyReceived <= 0 || !line.lot || line.landedUnitCost < 0)) {
      showToast("กรุณากรอก SKU จำนวน Lot และต้นทุนให้ครบ");
      return;
    }
    if (new Set(items.map((line) => `${line.sku}:${line.lot}`)).size !== items.length) {
      showToast("SKU และ Lot ต้องไม่ซ้ำกันในเอกสารเดียวกัน");
      return;
    }
    if (onSubmit({ receiveDate, items })) {
      setLines([emptyLine()]);
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(760px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold">รับสินค้าสำเร็จรูปเข้าคลัง</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-5">
          <div className="max-w-52">
            <Label className="mb-1 block text-xs font-semibold">วันที่รับ *</Label>
            <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} />
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 rounded-lg border p-3">
                <div className="col-span-12 md:col-span-4">
                  <Label className="mb-1 block text-xs">สินค้าสำเร็จรูป *</Label>
                  <NativeSelect value={line.sku} onChange={(e) => updateLine(index, "sku", e.target.value)}>
                    <option value="">เลือก SKU</option>
                    {products.filter((p) => p.isActive && ["Finished Product", "Cat", "Dog", "Other"].includes(p.type)).map((product) => (
                      <option key={product.sku} value={product.sku}>{product.sku} — {product.name}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label className="mb-1 block text-xs">จำนวน *</Label>
                  <Input type="number" min={1} value={line.qtyReceived || ""} onChange={(e) => updateLine(index, "qtyReceived", Number(e.target.value) || 0)} />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label className="mb-1 block text-xs">ต้นทุน/หน่วย *</Label>
                  <Input type="number" min={0} step="0.01" value={line.landedUnitCost || ""} onChange={(e) => updateLine(index, "landedUnitCost", Number(e.target.value) || 0)} />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label className="mb-1 block text-xs">Lot *</Label>
                  <Input value={line.lot} onChange={(e) => updateLine(index, "lot", e.target.value.trim())} placeholder="LOT-001" />
                </div>
                <div className="col-span-10 md:col-span-2">
                  <Label className="mb-1 block text-xs">วันหมดอายุ</Label>
                  <Input type="date" value={line.expiryDate} onChange={(e) => updateLine(index, "expiryDate", e.target.value)} />
                </div>
                {lines.length > 1 && (
                  <div className="col-span-2 flex items-end justify-end md:col-span-12">
                    <Button variant="ghost" size="sm" onClick={() => setLines((current) => current.filter((_, i) => i !== index))}>ลบรายการ</Button>
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>+ เพิ่มสินค้า</Button>
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2 border-t p-4 px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button onClick={handleSubmit} className="bg-[var(--erp-accent)] text-white">บันทึกรับสินค้า</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

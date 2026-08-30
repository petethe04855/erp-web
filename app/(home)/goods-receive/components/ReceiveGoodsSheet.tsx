"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

type FinishedProduct = { sku: string; name: string; type?: string; isActive?: boolean; isBundle?: boolean };
type ReceiveLine = {
  sku: string;
  qtyReceived: number;
  expiryDate: string;
  supplierLot: string;
  qcStatus: "Accepted" | "Quarantine" | "Rejected";
  rejectedQty: number;
  qcNote: string;
};

interface ReceiveGoodsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: FinishedProduct[];
  onSubmit: (data: {
    receiveDate: string;
    items: ReceiveLine[];
  }) => Promise<boolean>;
  showToast: (msg: string) => void;
}

const emptyLine = (): ReceiveLine => ({
  sku: "", qtyReceived: 0, expiryDate: "", supplierLot: "", qcStatus: "Accepted", rejectedQty: 0, qcNote: "",
});

export function ReceiveGoodsSheet({
  open, onOpenChange, products, onSubmit, showToast,
}: ReceiveGoodsSheetProps) {
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<ReceiveLine[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function updateLine<K extends keyof ReceiveLine>(index: number, field: K, value: ReceiveLine[K]) {
    setLines((current) => current.map((line, i) => i === index ? { ...line, [field]: value } : line));
  }

  async function handleSubmit() {
    setFormError("");
    const items = lines.filter((line) => line.sku || line.qtyReceived);
    if (!receiveDate || items.length === 0) {
      const message = "กรุณาระบุวันที่รับและสินค้าอย่างน้อย 1 รายการ";
      setFormError(message);
      showToast(message);
      return;
    }
    if (items.some((line) => !line.sku || line.qtyReceived <= 0)) {
      const message = "กรุณาเลือก SKU และระบุจำนวนให้ครบ";
      setFormError(message);
      showToast(message);
      return;
    }
    if (items.some((line) => !line.expiryDate)) {
      const message = "กรุณาระบุวันหมดอายุของสินค้าให้ครบทุก Lot";
      setFormError(message);
      showToast(message);
      return;
    }
    if (items.some((line) => line.expiryDate < receiveDate)) {
      const message = "วันหมดอายุต้องไม่ก่อนวันที่รับสินค้า";
      setFormError(message);
      showToast(message);
      return;
    }
    if (items.some((line) => line.rejectedQty > line.qtyReceived)) {
      const message = "จำนวนไม่ผ่าน QC ต้องไม่เกินจำนวนรับ";
      setFormError(message); showToast(message); return;
    }
    setSaving(true);
    try {
      if (await onSubmit({ receiveDate, items })) {
        setLines([emptyLine()]);
        setFormError("");
        onOpenChange(false);
      }
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "ไม่สามารถบันทึกรับสินค้าได้");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(760px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold">รับสินค้าสำเร็จรูปเข้าคลัง</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-5">
          {formError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
          <div className="max-w-52">
            <Label className="mb-1 block text-xs font-semibold">วันที่รับ *</Label>
            <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} />
          </div>
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            รับเข้าโดยไม่ผูก PO · ระบบจะสร้าง Lot ภายในอัตโนมัติ และใช้วันหมดอายุจัดลำดับ FEFO
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 rounded-lg border p-3">
                <div className="col-span-12 md:col-span-4">
                  <Label className="mb-1 block text-xs">สินค้าสำเร็จรูป *</Label>
                  <NativeSelect value={line.sku} onChange={(e) => updateLine(index, "sku", e.target.value)}>
                    <option value="">เลือก SKU</option>
                    {products.filter((p) => p.isActive !== false && p.sku).map((product) => (
                      <option key={product.sku} value={product.sku}>{product.sku} — {product.name}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Label className="mb-1 block text-xs">จำนวน *</Label>
                  <Input type="number" min={1} value={line.qtyReceived || ""} onChange={(e) => updateLine(index, "qtyReceived", Number(e.target.value) || 0)} />
                </div>
                <div className="col-span-4 md:col-span-3">
                  <Label className="mb-1 block text-xs">Lot</Label>
                  <Input disabled value="สร้างอัตโนมัติเมื่อบันทึก" />
                </div>
                <div className="col-span-6 md:col-span-3"><Label className="mb-1 block text-xs">Lot ผู้ขาย</Label><Input value={line.supplierLot} onChange={(e) => updateLine(index, "supplierLot", e.target.value)} placeholder="ถ้ามี" /></div>
                <div className="col-span-6 md:col-span-3"><Label className="mb-1 block text-xs">ผลตรวจรับ</Label><NativeSelect value={line.qcStatus} onChange={(e) => updateLine(index, "qcStatus", e.target.value as ReceiveLine["qcStatus"])}><option value="Accepted">ผ่าน QC</option><option value="Quarantine">กักกัน</option><option value="Rejected">ไม่ผ่าน</option></NativeSelect></div>
                <div className="col-span-6 md:col-span-3"><Label className="mb-1 block text-xs">จำนวนไม่ผ่าน</Label><Input type="number" min={0} value={line.rejectedQty || ""} onChange={(e) => updateLine(index, "rejectedQty", Number(e.target.value) || 0)} /></div>
                <div className="col-span-10 md:col-span-3">
                  <Label className="mb-1 block text-xs">วันหมดอายุ *</Label>
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
          <Button onClick={handleSubmit} disabled={saving} className="bg-[var(--erp-accent)] text-white">{saving ? "กำลังบันทึก..." : "บันทึกรับสินค้า"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

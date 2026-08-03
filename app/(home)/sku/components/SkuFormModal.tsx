"use client";

import { Button } from "@/components/ui/button";
import { ValidationAlert } from "@/components/ValidationAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateProductInput } from "@/lib/store/erpWorkflow";

interface SkuFormModalProps {
  modalMode: "add" | "edit";
  selectedSku?: string;
  form: CreateProductInput;
  setForm: React.Dispatch<React.SetStateAction<CreateProductInput>>;
  error: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SkuFormModal({
  modalMode,
  selectedSku,
  form,
  setForm,
  error,
  onClose,
  onSave,
}: SkuFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[520px] rounded-xl border border-border bg-card p-7 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-base font-bold">
            {modalMode === "add"
              ? "สร้างสินค้าสำเร็จรูป"
              : `แก้ไขสินค้า - ${selectedSku}`}
          </h2>
          <Button variant="ghost" size="xs" onClick={onClose}>
            Close
          </Button>
        </div>

        <ValidationAlert message={error} />

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              รหัส SKU *
            </Label>
            <Input
              value={form.sku}
              onChange={(e) =>
                setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))
              }
              placeholder="เช่น CHICKEN-BREAST"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              ชื่อสินค้า *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="เช่น อกไก่ หรือตับกระต่าย"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">Barcode</Label>
            <Input
              value={form.barcode ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, barcode: e.target.value }))
              }
              placeholder="ระบุถ้ามี"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              ราคาขาย (บาท) *
            </Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.retailPrice || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  retailPrice: Number(e.target.value) || 0,
                }))
              }
              placeholder="0.00"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              {modalMode === "add" ? "จำนวนเริ่มต้น (Stock)" : "จำนวน Stock"}
            </Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={form.stock || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  stock: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                }))
              }
              placeholder="0"
            />
          </div>
          <div className="col-span-2">
            <Label className="mb-1 block text-xs font-semibold">หมายเหตุ</Label>
            <Textarea
              value={form.note ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="รายละเอียดเพิ่มเติม"
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          การเปลี่ยนจำนวน Stock จะบันทึกส่วนต่างเป็น Stock Movement อัตโนมัติ
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={onSave}
            className="bg-[var(--erp-accent)] text-white"
          >
            {modalMode === "add" ? "บันทึกสินค้า" : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </div>
    </div>
  );
}

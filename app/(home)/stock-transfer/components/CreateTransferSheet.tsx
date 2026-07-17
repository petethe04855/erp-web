"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";

const LOCATIONS = [
  "คลังหลัก",
  "ออฟฟิศ",
  "บูธ/งาน",
  "Shopee Fulfillment",
  "Consignment",
  "อื่นๆ",
];

interface Product {
  sku: string;
  name: string;
  stock: number;
  reservedQty: number;
}

interface TransferFormState {
  sku: string;
  qty: number | "";
  fromLocation: string;
  toLocation: string;
  note: string;
}

const BLANK_FORM: TransferFormState = {
  sku: "",
  qty: 1,
  fromLocation: "คลังหลัก",
  toLocation: "ออฟฟิศ",
  note: "",
};

interface CreateTransferSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: {
    sku: string;
    qty: number;
    fromLocation: string;
    toLocation: string;
    note: string;
  }) => void;
  showToast: (msg: string) => void;
}

export function CreateTransferSheet({
  open,
  onOpenChange,
  products,
  onSubmit,
  showToast,
}: CreateTransferSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<TransferFormState>(BLANK_FORM);

  const selectedProduct = products.find((p) => p.sku === form.sku);
  const available = selectedProduct
    ? selectedProduct.stock - selectedProduct.reservedQty
    : 0;
  const isOverStock = !!form.sku && Number(form.qty) > available;

  const handleFormSubmit = () => {
    if (!form.sku) return;
    if (form.qty === "" || Number(form.qty) < 1) {
      showToast("กรุณากรอกจำนวนอย่างน้อย 1 ชิ้น");
      return;
    }
    if (isOverStock) {
      showToast(`จำนวนเกินสต๊อกที่พร้อมโอน (${available} ชิ้น)`);
      return;
    }
    if (form.fromLocation === form.toLocation) {
      showToast("ต้นทางและปลายทางต้องไม่เหมือนกัน");
      return;
    }

    onSubmit({
      sku: form.sku,
      qty: Number(form.qty),
      fromLocation: form.fromLocation,
      toLocation: form.toLocation,
      note: form.note,
    });

    setForm(BLANK_FORM);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            โอนสินค้า
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            ย้ายสินค้าจากสถานที่หนึ่งไปอีกสถานที่
          </div>
        </SheetHeader>

        <SheetBody className="grid gap-5 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                สินค้าที่โอน *
              </Label>
              <NativeSelect
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
              >
                <option value="">-- เลือกสินค้า --</option>
                {products.map((p) => {
                  const avail = p.stock - p.reservedQty;
                  return (
                    <option key={p.sku} value={p.sku}>
                      {p.name} (พร้อมโอน: {avail} ชิ้น)
                    </option>
                  );
                })}
              </NativeSelect>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                จำนวน *
              </Label>
              <Input
                type="number"
                min={1}
                max={available}
                value={form.qty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    qty: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  }))
                }
                style={{
                  borderColor: isOverStock ? c.neg : "var(--erp-border)",
                }}
              />
              {isOverStock && (
                <p className="mt-1 text-[11px] font-bold text-red-500">
                  เกินสต๊อกที่พร้อมโอน ({available} ชิ้น)
                </p>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                  จาก (ต้นทาง)
                </Label>
                <NativeSelect
                  value={form.fromLocation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fromLocation: e.target.value }))
                  }
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div
                className="text-lg pb-1.5 font-bold"
                style={{ color: "var(--erp-ink3)" }}
              >
                →
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                  ไปยัง (ปลายทาง)
                </Label>
                <NativeSelect
                  value={form.toLocation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, toLocation: e.target.value }))
                  }
                  style={{
                    borderColor:
                      form.fromLocation === form.toLocation
                        ? c.neg
                        : "var(--erp-border)",
                  }}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            {form.fromLocation === form.toLocation && (
              <p className="text-[11px] font-bold text-red-500">
                ต้นทางและปลายทางต้องไม่เหมือนกัน
              </p>
            )}

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                หมายเหตุ
              </Label>
              <Textarea
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                rows={3}
                placeholder="เช่น ส่งไปบูธงาน Pet Expo 2026"
              />
            </div>
          </div>
        </SheetBody>

        <SheetFooter className="flex justify-end gap-2 p-4 px-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={!form.sku || isOverStock || form.fromLocation === form.toLocation}
            className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none disabled:opacity-50 disabled:pointer-events-none"
          >
            บันทึกการโอน
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

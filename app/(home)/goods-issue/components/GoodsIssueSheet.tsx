"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Mono } from "@/components/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import type { GoodsIssueReason } from "@/lib/store/erpWorkflow";
import { useTheme } from "@/lib/design/ThemeContext";
import { ValidationAlert } from "@/components/ValidationAlert";

const REASONS: GoodsIssueReason[] = [
  "ตัวอย่าง",
  "เสียหาย/หมดอายุ",
  "ใช้ภายใน",
  "โปรโมชัน",
  "อื่นๆ",
];

const BLANK = {
  sku: "",
  qty: 1,
  reason: "ใช้ภายใน" as GoodsIssueReason,
  note: "",
};

interface Product {
  sku: string;
  name: string;
  stock: number;
  reservedQty: number;
  isBundle?: boolean;
}

interface GoodsIssueSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (issue: {
    sku: string;
    qty: number;
    reason: GoodsIssueReason;
    note: string;
  }) => Promise<boolean> | boolean;
  products: Product[];
  showToast: (msg: string) => void;
}

export function GoodsIssueSheet({
  open,
  onOpenChange,
  onSubmit,
  products,
  showToast,
}: GoodsIssueSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<{
    sku: string;
    qty: number | "";
    reason: GoodsIssueReason;
    note: string;
  }>(BLANK);
  const [validationError, setValidationError] = useState("");

  const selectedProduct = products.find((p) => p.sku === form.sku);
  const available = selectedProduct
    ? selectedProduct.stock - selectedProduct.reservedQty
    : 0;
  const isOverStock = !!form.sku && !selectedProduct?.isBundle && Number(form.qty) > available;

  async function handleSubmit() {
    if (!form.sku) {
      setValidationError("กรุณาเลือกสินค้า");
      return;
    }
    if (form.qty === "" || Number(form.qty) < 1) {
      setValidationError("กรุณากรอกจำนวนอย่างน้อย 1 ชิ้น");
      return;
    }
    if (isOverStock) {
      setValidationError("จำนวนเกินสต๊อกพร้อมเบิก");
      return;
    }

    const success = await onSubmit({
      sku: form.sku,
      qty: Number(form.qty),
      reason: form.reason,
      note: form.note,
    });

    if (success) {
      setValidationError("");
      setForm(BLANK);
      onOpenChange(false);
    }
  }

  const isFormInvalid =
    !form.sku || isOverStock || form.qty === "" || Number(form.qty) < 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(520px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            Issue Goods
          </SheetTitle>
        </SheetHeader>
        <ValidationAlert message={validationError} />
        <SheetBody className="space-y-3">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Product *
            </Label>
            <NativeSelect
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              className="w-full cursor-pointer"
            >
              <option value="">Select product</option>
              {products.map((p) => {
                const avail = p.stock - p.reservedQty;
                return (
                  <option key={p.sku} value={p.sku}>
                    {p.name} · available {avail}
                  </option>
                );
              })}
            </NativeSelect>
          </div>

          {selectedProduct && (
            <div
              className="grid grid-cols-3 border rounded-lg overflow-hidden"
              style={{ borderColor: "var(--erp-border)" }}
            >
              {[
                ["Stock", selectedProduct.stock],
                ["Reserved", selectedProduct.reservedQty],
                ["Available", available],
              ].map(([label, value], i) => (
                <div
                  key={label}
                  className="p-3"
                  style={{
                    borderRight: i < 2 ? "1px solid var(--erp-border)" : "none",
                  }}
                >
                  <div
                    className="text-[10px] text-muted-foreground uppercase tracking-[0.10em]"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {label}
                  </div>
                  <Mono t={t} size={18} weight={600}>
                    {value}
                  </Mono>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Quantity *
            </Label>
            <Input
              type="number"
              min={1}
              max={available > 0 ? available : undefined}
              value={form.qty}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  qty:
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                }))
              }
              style={{
                borderColor: isOverStock ? "var(--erp-neg)" : undefined,
              }}
            />
            {isOverStock && (
              <div
                className="mt-1 text-xs text-red-500"
                style={{ color: "var(--erp-neg)" }}
              >
                เกินสต๊อกพร้อมเบิก ({available} ชิ้น)
              </div>
            )}
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Purpose
            </Label>
            <NativeSelect
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  reason: e.target.value as GoodsIssueReason,
                }))
              }
              className="w-full cursor-pointer"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Note
            </Label>
            <Textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="รายละเอียดการเบิก..."
            />
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2 border-t p-4 px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
              color: "#374151",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isFormInvalid}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
            style={{ opacity: isFormInvalid ? 0.45 : 1 }}
          >
            Save Issue
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

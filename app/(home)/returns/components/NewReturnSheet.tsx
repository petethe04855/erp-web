"use client";

import { useState, useEffect } from "react";
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
import type { ReturnReason, ReturnCondition } from "@/lib/store/erpWorkflow";
import { ValidationAlert } from "@/components/ValidationAlert";

const REASONS: ReturnReason[] = [
  "สินค้าชำรุด",
  "ผิดสินค้า",
  "ลูกค้าเปลี่ยนใจ",
  "ผิดขนาด/รุ่น",
  "อื่นๆ",
];
interface FormState {
  soRef: string;
  sku: string;
  qty: number | "";
  condition: ReturnCondition;
  reason: ReturnReason;
  note: string;
  channel: string;
}

const BLANK: FormState = {
  soRef: "",
  sku: "",
  qty: 1,
  condition: "ดี",
  reason: "สินค้าชำรุด",
  note: "",
  channel: "Manual",
};

interface Product {
  sku: string;
  name: string;
}

interface SalesOrder {
  id: number | string;
  code?: string;
  customer: string;
  channel: string;
  status: string;
  lines?: Array<{ sku: string; qty: number }>;
}

interface StockReturn {
  soRef: string;
  sku: string;
  qty: number;
  status: string;
}

interface NewReturnSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  salesOrders: SalesOrder[];
  stockReturns: StockReturn[];
  onSubmit: (data: {
    soRef: string;
    sku: string;
    qty: number;
    condition: ReturnCondition;
    reason: ReturnReason;
    note: string;
    channel: string;
  }) => Promise<void>;
  showToast: (msg: string) => void;
}

export function NewReturnSheet({
  open,
  onOpenChange,
  products,
  salesOrders,
  stockReturns,
  onSubmit,
  showToast,
}: NewReturnSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<FormState>(BLANK);
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(BLANK);
      setValidationError("");
    }
  }, [open]);

  const completedSOs = salesOrders.filter((o) => o.status === "Completed");
  const selectedSO = completedSOs.find((order) => String(order.id) === form.soRef);
  const soldSkus = new Set(selectedSO?.lines?.map((line) => line.sku) ?? []);
  const soldQty = selectedSO?.lines
    ?.filter((line) => line.sku === form.sku)
    .reduce((sum, line) => sum + line.qty, 0) ?? 0;
  const returnedQty = selectedSO
    ? stockReturns
        .filter(
          (item) =>
            item.sku === form.sku &&
            item.status.toLowerCase() !== "cancelled" &&
            (String(item.soRef) === String(selectedSO.id) ||
              String(item.soRef) === String(selectedSO.code)),
        )
        .reduce((sum, item) => sum + item.qty, 0)
    : 0;
  const remainingQty = Math.max(0, soldQty - returnedQty);
  const returnableProducts = selectedSO
    ? products.filter((product) => {
        if (!soldSkus.has(product.sku)) return false;
        const productSoldQty = selectedSO.lines
          ?.filter((line) => line.sku === product.sku)
          .reduce((sum, line) => sum + line.qty, 0) ?? 0;
        const productReturnedQty = stockReturns
          .filter(
            (item) =>
              item.sku === product.sku &&
              item.status.toLowerCase() !== "cancelled" &&
              (String(item.soRef) === String(selectedSO.id) ||
                String(item.soRef) === String(selectedSO.code)),
          )
          .reduce((sum, item) => sum + item.qty, 0);
        return productReturnedQty < productSoldQty;
      })
    : [];

  async function handleSubmit() {
	if (!form.soRef) {
		setValidationError("กรุณาเลือก Sales Order ที่จัดส่งสำเร็จ");
		return;
	}
    if (!form.sku) {
      setValidationError("กรุณาเลือกสินค้า");
      return;
    }
    if (form.qty === "" || Number(form.qty) < 1) {
      setValidationError("กรุณากรอกจำนวนอย่างน้อย 1 ชิ้น");
      return;
    }
    if (Number(form.qty) > remainingQty) {
      setValidationError(
        `คืนได้สูงสุด ${remainingQty} ชิ้น (ซื้อ ${soldQty} ชิ้น คืนไปแล้ว ${returnedQty} ชิ้น)`,
      );
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        soRef: form.soRef,
        sku: form.sku,
        qty: Number(form.qty),
        condition: form.condition,
        reason: form.reason,
        note: form.note,
        channel: form.channel,
      });
      setValidationError("");
      onOpenChange(false);
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "บันทึกรายการคืนไม่สำเร็จ",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            New Return
          </SheetTitle>
          <div
            className="text-xs text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            บันทึกการรับสินค้ากลับจากลูกค้า
          </div>
        </SheetHeader>
        <ValidationAlert message={validationError} />
        <SheetBody className="space-y-3">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Sales Order
            </Label>
            <NativeSelect
              value={form.soRef}
              onChange={(e) => {
                const soId = e.target.value;
                const so = salesOrders.find((o) => String(o.id) === soId);
                setForm((f) => ({
                  ...f,
                  soRef: soId,
                  sku: "",
                  qty: 1,
                  channel: so ? so.channel : f.channel,
                }));
              }}
            >
			  <option value="">Select completed Sales Order</option>
              {completedSOs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.customer}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Product
            </Label>
            <NativeSelect
              value={form.sku}
              onChange={(e) =>
                setForm((f) => ({ ...f, sku: e.target.value, qty: 1 }))
              }
            >
              <option value="">Select product</option>
              {returnableProducts.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Quantity
            </Label>
            <Input
              type="number"
              min={1}
              max={remainingQty || undefined}
              value={form.qty}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  qty:
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                }))
              }
            />
            {form.sku && (
              <div className="mt-1 text-xs text-muted-foreground">
                ซื้อ {soldQty} ชิ้น · คืนแล้ว {returnedQty} ชิ้น · คืนได้อีก {remainingQty} ชิ้น
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                Condition
              </Label>
              <NativeSelect
                value={form.condition}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    condition: e.target.value as ReturnCondition,
                  }))
                }
              >
                <option value="ดี">ดี · add back to stock</option>
                <option value="เสียหาย">เสียหาย · do not add stock</option>
              </NativeSelect>
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                Channel
              </Label>
              <NativeSelect
                value={form.channel}
                disabled={!!form.soRef}
                onChange={(e) =>
                  setForm((f) => ({ ...f, channel: e.target.value }))
                }
              >
                <option value="Manual">Manual</option>
                <option value="LINE">LINE</option>
                <option value="Shopee">Shopee</option>
                <option value="TikTok">TikTok</option>
              </NativeSelect>
            </div>
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Reason
            </Label>
            <NativeSelect
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  reason: e.target.value as ReturnReason,
                }))
              }
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
              placeholder="Additional details"
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
			disabled={submitting || !form.soRef || !form.sku || form.qty === "" || Number(form.qty) < 1 || Number(form.qty) > remainingQty}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer disabled:opacity-45"
          >
            {submitting ? "Saving..." : "Save Return"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import { useVatRate } from "@/features/settings/hooks/useVatRate";
import type { CreateOrderDTO } from "../types/order";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateOrderDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function OrderForm(props: Props) {
  const { vatRate, isLoading: vatLoading, isError: vatError } = useVatRate();
  const [customer, setCustomer] = useState("");
  const [includeVat, setIncludeVat] = useState(true);
  const [lines, setLines] = useState<ItemLine[]>([
    { sku: "", quantity: 1, price: 0 },
  ]);

  // Reset draft state when the dialog closes: compare with previous value
  // during render (React docs "adjusting state on prop change" pattern)
  // instead of setState-in-effect.
  const [prevOpen, setPrevOpen] = useState(props.open);
  if (prevOpen && !props.open) {
    setPrevOpen(false);
    setCustomer("");
    setIncludeVat(true);
    setLines([{ sku: "", quantity: 1, price: 0 }]);
  } else if (!prevOpen && props.open) {
    setPrevOpen(true);
  }

  const rawSubtotal = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0),
    0,
  );
  // Preview-only: the backend remains the owner of the final VAT calculation.
  const vatAmount = includeVat ? rawSubtotal * (vatRate / 100) : 0;
  const totalAmount = rawSubtotal + vatAmount;

  const handleSubmit = async () => {
    if (!customer.trim()) {
      throw new Error("กรุณาระบุชื่อลูกค้า (Customer)");
    }
    const validLines = lines.filter((l) => l.sku.trim() !== "");
    if (validLines.length === 0) {
      throw new Error("กรุณาเลือก SKU สินค้าอย่างน้อย 1 รายการ");
    }

    // Check if any line exceeds available stock
    for (const item of validLines) {
      if (item.maxStock !== undefined && item.maxStock !== null) {
        if (item.maxStock <= 0) {
          throw new Error(
            `สินค้า ${item.sku} (${item.name || "ไม่มีชื่อ"}) สินค้าหมดในสต็อก ไม่สามารถสร้างใบสั่งขายได้`,
          );
        }
        if (item.quantity > item.maxStock) {
          throw new Error(
            `สินค้า ${item.sku} (${item.name || "ไม่มีชื่อ"}) สั่งจำนวน ${item.quantity} ชิ้น ซึ่งเกินสต็อกพร้อมขายที่มีอยู่ (${item.maxStock} ชิ้น)`,
          );
        }
      }
    }

    await props.onSubmit({
      customerName: customer.trim(),
      channel: "Manual",
      includeVat,
      items: validLines,
    });

    // Reset after success
    setCustomer("");
    setIncludeVat(true);
    setLines([{ sku: "", quantity: 1, price: 0 }]);
  };

  return (
    <FormDialog
      {...props}
      title="สร้างใบสั่งขาย (New Sales Order)"
      description="กรอกข้อมูลลูกค้า และเลือกสินค้าจากรายการ ระบบจะคำนวณราคาให้อัตโนมัติ"
      onSubmit={handleSubmit}
    >
      <div>
        <RecordLookup
          kind="customers"
          label="ชื่อลูกค้า / บัญชีลูกค้า"
          value={customer}
          onChange={setCustomer}
        />
      </div>
      <ItemLines
        value={lines}
        onChange={setLines}
        enforceMaxStock={true}
        inventoryOnly={true}
      />

      <div className="rounded-lg border bg-muted/20 p-3 space-y-3 mt-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-foreground">
          <input
            type="checkbox"
            checked={includeVat}
            onChange={(e) => setIncludeVat(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span>
            คิดภาษีมูลค่าเพิ่ม (Include VAT{" "}
            {vatLoading ? "…" : vatError ? `${vatRate}% (ประมาณการ - ยังยืนยันไม่ได้)` : `${vatRate}%`})
          </span>
        </label>

        <div className="space-y-1.5 pt-2 border-t border-border/60 text-muted-foreground">
          <div className="flex justify-between">
            <span>ยอดรวมสินค้า (Subtotal):</span>
            <span className="font-mono text-foreground">
              ฿
              {rawSubtotal.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>ภาษีมูลค่าเพิ่ม {vatRate}% (VAT):</span>
            <span className="font-mono text-foreground">
              {includeVat
                ? `฿${vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "ยกเว้นภาษี (0.00)"}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border/40 font-semibold text-sm text-foreground">
            <span>ยอดสุทธิรวมทั้งสิ้น:</span>
            <span className="font-mono text-primary">
              ฿
              {totalAmount.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </FormDialog>
  );
}

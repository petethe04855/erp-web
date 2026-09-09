"use client";

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { CreateOrderDTO } from "../types/order";

import { Select } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateOrderDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function OrderForm(props: Props) {
  const [customer, setCustomer] = useState("");
  const [channel, setChannel] = useState("Manual");
  const [includeVat, setIncludeVat] = useState(true);
  const [lines, setLines] = useState<ItemLine[]>([
    { sku: "", quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    if (!props.open) {
      setCustomer("");
      setChannel("Manual");
      setIncludeVat(true);
      setLines([{ sku: "", quantity: 1, price: 0 }]);
    }
  }, [props.open]);

  const rawSubtotal = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0),
    0,
  );
  const vatAmount = includeVat ? rawSubtotal * 0.07 : 0;
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
      channel: channel || "Manual",
      includeVat,
      items: validLines,
    });

    // Reset after success
    setCustomer("");
    setChannel("Manual");
    setIncludeVat(true);
    setLines([{ sku: "", quantity: 1, price: 0 }]);
  };

  return (
    <FormDialog
      {...props}
      title="สร้างใบสั่งขาย (New Sales Order)"
      description="กรอกข้อมูลลูกค้า เลือกช่องทางการขาย และเลือก SKU สินค้าจากรายการ ระบบจะคำนวณราคาให้อัตโนมัติ"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <RecordLookup
            kind="customers"
            label="ชื่อลูกค้า / บัญชีลูกค้า"
            value={customer}
            onChange={setCustomer}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground">
            ช่องทางการขาย (Channel)
            <Select
              className="mt-1.5 text-xs"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="Manual">Manual (หน้าร้าน / ทั่วไป)</option>
              <option value="TikTok">TikTok (TikTok Shop)</option>
              <option value="Shopee">Shopee</option>
              <option value="LINE">LINE</option>
            </Select>
          </label>
        </div>
      </div>
      <ItemLines value={lines} onChange={setLines} enforceMaxStock={true} />

      <div className="rounded-lg border bg-muted/20 p-3 space-y-3 mt-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-foreground">
          <input
            type="checkbox"
            checked={includeVat}
            onChange={(e) => setIncludeVat(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span>คิดภาษีมูลค่าเพิ่ม (Include VAT 7%)</span>
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
            <span>ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
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

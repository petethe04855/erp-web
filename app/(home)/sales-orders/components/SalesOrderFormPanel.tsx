"use client";

import React from "react";
import SlidePanel from "@/components/SlidePanel";
import { Mono } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ValidationAlert } from "@/components/ValidationAlert";
import type { DesignTokens } from "@/lib/design/tokens";
import type { Product } from "@/lib/store/erpWorkflow";

const CHANNELS = ["Manual", "LINE", "Shopee", "TikTok"] as const;
export type Line = { sku: string; qty: number | ""; unitPrice?: number };

interface Props {
  t: DesignTokens;
  open: boolean;
  onClose: () => void;
  form: { customer: string; date: string; channel: string; qtRef: string; lines: Line[] };
  setForm: React.Dispatch<React.SetStateAction<{ customer: string; date: string; channel: string; qtRef: string; lines: Line[] }>>;
  products: Product[];
  lineTotal: number;
  error: string;
  onSubmit: () => void;
}

export default function SalesOrderFormPanel({ t, open, onClose, form, setForm, products, lineTotal, error, onSubmit }: Props) {
  const sellable = products.filter((p) => p.isActive && p.type === "Finished Product");
  const updateLine = (index: number, patch: Partial<Line>) => setForm((current) => ({
    ...current,
    lines: current.lines.map((line, i) => i === index ? { ...line, ...patch } : line),
  }));

  return (
    <SlidePanel open={open} onClose={onClose} title="สร้าง Sales Entry" subtitle="บันทึกการขายและจองสินค้าสำเร็จรูป"
      footer={<div className="flex justify-end gap-2.5"><Button variant="outline" onClick={onClose}>ยกเลิก</Button><Button onClick={onSubmit} className="bg-[var(--erp-accent)] text-white">บันทึก Sales Entry</Button></div>}>
      <div className="grid gap-4">
        <ValidationAlert message={error} />
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="mb-1 block text-xs font-semibold">ลูกค้า *</Label><Input value={form.customer} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))} /></div>
          <div><Label className="mb-1 block text-xs font-semibold">วันที่</Label><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
        </div>
        <div><Label className="mb-1 block text-xs font-semibold">ช่องทาง</Label><NativeSelect value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}>{CHANNELS.map((channel) => <option key={channel}>{channel}</option>)}</NativeSelect></div>

        <div className="flex items-center justify-between"><span className="text-sm font-semibold">รายการสินค้า</span><Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, lines: [...f.lines, { sku: "", qty: 1 }] }))}>+ เพิ่มสินค้า</Button></div>
        {form.lines.map((line, index) => {
          const product = sellable.find((item) => item.sku === line.sku);
          const available = product ? Math.max(0, product.stock - product.reservedQty) : 0;
          const unitPrice = line.unitPrice ?? product?.retailPrice ?? 0;
          return (
            <div key={index} className="grid grid-cols-[1fr_90px_120px_32px] items-end gap-2 rounded-lg border p-3">
              <div><Label className="mb-1 block text-xs">สินค้า *</Label><NativeSelect value={line.sku} onChange={(e) => { const selected = sellable.find((item) => item.sku === e.target.value); updateLine(index, { sku: e.target.value, unitPrice: selected?.retailPrice ?? 0 }); }}><option value="">เลือก SKU</option>{sellable.map((item) => <option key={item.sku} value={item.sku}>{item.sku} — {item.name} (พร้อมขาย {Math.max(0, item.stock - item.reservedQty)})</option>)}</NativeSelect></div>
              <div><Label className="mb-1 block text-xs">จำนวน *</Label><Input type="number" min={1} max={available || undefined} value={line.qty} onChange={(e) => updateLine(index, { qty: e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value) || 1)) })} /></div>
              <div><Label className="mb-1 block text-xs">ราคาขาย/ชิ้น *</Label><Input type="number" min={0.01} step="0.01" value={unitPrice || ""} onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) || 0 })} /></div>
              <Button variant="ghost" size="xs" disabled={form.lines.length === 1} onClick={() => setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== index) }))}>×</Button>
              {product && Number(line.qty) > available && <div className="col-span-4 text-xs text-red-600">Stock ไม่พอ: พร้อมขาย {available}</div>}
            </div>
          );
        })}
        <div className="flex justify-between rounded-lg bg-muted p-3"><span className="text-sm">ยอดขายรวม</span><Mono t={t} size={18} weight={600}>฿{lineTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</Mono></div>
      </div>
    </SlidePanel>
  );
}

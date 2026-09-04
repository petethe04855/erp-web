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
import type { Quotation } from "@/lib/mockData";

const CHANNELS = ["Manual", "LINE", "Shopee", "TikTok"] as const;
export type Line = { sku: string; qty: number | ""; unitPrice?: number };

interface Props {
  t: DesignTokens;
  open: boolean;
  onClose: () => void;
  form: { customer: string; date: string; channel: string; qtRef: string; lines: Line[] };
  setForm: React.Dispatch<React.SetStateAction<{ customer: string; date: string; channel: string; qtRef: string; lines: Line[] }>>;
  products: Product[];
  quotations: Quotation[];
  lineTotal: number;
  error: string;
  onSubmit: () => void;
}

export default function SalesOrderFormPanel({ t, open, onClose, form, setForm, products, quotations, lineTotal, error, onSubmit }: Props) {
  const sellable = products.filter((p) => p.isActive && p.type === "Finished Product");
  return (
    <SlidePanel open={open} onClose={onClose} title="สร้าง Sales Entry" subtitle="บันทึกการขายและจองสินค้าสำเร็จรูป"
      footer={<div className="flex justify-end gap-2.5"><Button variant="outline" onClick={onClose}>ยกเลิก</Button><Button onClick={onSubmit} className="bg-[var(--erp-accent)] text-white">บันทึก Sales Entry</Button></div>}>
      <div className="grid gap-4">
        <ValidationAlert message={error} />
        <div>
          <Label className="mb-1 block text-xs font-semibold">Quotation *</Label>
          <NativeSelect
            value={form.qtRef}
            onChange={(event) => {
              const qtRef = event.target.value;
              const quotation = quotations.find((item) => String(item.code || item.id) === qtRef);
              setForm((current) => quotation ? {
                ...current,
                qtRef,
                customer: quotation.customer,
                channel: quotation.leadSource.toLowerCase().includes("tiktok")
                  ? "TikTok"
                  : quotation.leadSource.toLowerCase().includes("shopee")
                    ? "Shopee"
                    : "Manual",
                lines: quotation.lines.map((line) => ({
                  sku: line.sku,
                  qty: line.qty,
                  unitPrice: line.price ?? products.find((product) => product.sku === line.sku)?.retailPrice ?? 0,
                })),
              } : { ...current, qtRef: "", customer: "", lines: [{ sku: "", qty: 1 }] });
            }}
          >
            <option value="">เลือก Quotation ที่อนุมัติแล้ว</option>
            {quotations.map((quotation) => (
              <option key={quotation.id} value={String(quotation.code || quotation.id)}>
                {quotation.code || quotation.id} — {quotation.customer}
              </option>
            ))}
          </NativeSelect>
          {quotations.length === 0 && (
            <div className="mt-1 text-xs text-muted-foreground">ไม่มี Quotation ที่พร้อมสร้าง Sales Entry</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="mb-1 block text-xs font-semibold">ชื่อบริษัท *</Label><Input value={form.customer} readOnly placeholder="เลือกจาก Quotation" className="bg-muted" /></div>
          <div><Label className="mb-1 block text-xs font-semibold">วันที่</Label><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
        </div>
        <div><Label className="mb-1 block text-xs font-semibold">ช่องทาง</Label><NativeSelect value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}>{CHANNELS.map((channel) => <option key={channel}>{channel}</option>)}</NativeSelect></div>

        <div className="flex items-center justify-between"><span className="text-sm font-semibold">รายการสินค้าจาก Quotation</span></div>
        {form.lines.map((line, index) => {
          const product = sellable.find((item) => item.sku === line.sku);
          const available = product ? Math.max(0, product.stock - product.reservedQty) : 0;
          const unitPrice = line.unitPrice ?? product?.retailPrice ?? 0;
          return (
            <div key={index} className="grid grid-cols-[1fr_90px_120px_32px] items-end gap-2 rounded-lg border p-3">
              <div><Label className="mb-1 block text-xs">สินค้า *</Label><Input value={product ? `${product.sku} — ${product.name}` : line.sku} readOnly className="bg-muted" /></div>
              <div><Label className="mb-1 block text-xs">จำนวน *</Label><Input value={line.qty} readOnly className="bg-muted" /></div>
              <div><Label className="mb-1 block text-xs">ราคาขาย/ชิ้น *</Label><Input value={unitPrice || ""} readOnly className="bg-muted" /></div>
              <div />
              {product && Number(line.qty) > available && <div className="col-span-4 text-xs text-red-600">Stock ไม่พอ: พร้อมขาย {available}</div>}
            </div>
          );
        })}
        <div className="flex justify-between rounded-lg bg-muted p-3"><span className="text-sm">ยอดขายรวม</span><Mono t={t} size={18} weight={600}>฿{lineTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</Mono></div>
      </div>
    </SlidePanel>
  );
}

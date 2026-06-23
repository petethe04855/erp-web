"use client";
import React from "react";
import SlidePanel from "@/components/SlidePanel";
import { Btn, Mono, fmtBaht } from "@/components/ui";
import type { DesignTokens } from "@/lib/design/tokens";
import type { Product } from "@/lib/store/erpWorkflow";

const CHANNELS = ["Manual", "LINE", "Shopee", "TikTok"] as const;
type Line = { sku: string; qty: number };

function panelInput(
  surface: string,
  border: string,
  ink: string,
): React.CSSProperties {
  return {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${border}`,
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    background: surface,
    color: ink,
  };
}

interface SalesOrderFormPanelProps {
  t: DesignTokens;
  open: boolean;
  onClose: () => void;
  form: {
    customer: string;
    date: string;
    channel: string;
    qtRef: string;
    lines: Line[];
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      customer: string;
      date: string;
      channel: string;
      qtRef: string;
      lines: Line[];
    }>
  >;
  products: Product[];
  lineTotal: number;
  onSubmit: () => void;
}

export default function SalesOrderFormPanel({
  t,
  open,
  onClose,
  form,
  setForm,
  products,
  lineTotal,
  onSubmit,
}: SalesOrderFormPanelProps) {
  const c = t.color;

  const addLine = () =>
    setForm((f) => ({ ...f, lines: [...f.lines, { sku: "", qty: 1 }] }));
  const removeLine = (i: number) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i: number, field: keyof Line, val: string | number) => {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((line, idx) =>
        idx === i ? { ...line, [field]: val } : line,
      ),
    }));
  };

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="สร้าง Sales Order"
      subtitle="กรอกข้อมูลออร์เดอร์ขายใหม่"
      footer={
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              border: `1px solid ${c.border}`,
              borderRadius: 7,
              background: c.surface,
              cursor: "pointer",
              fontSize: 13,
              color: c.ink2,
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onSubmit}
            style={{
              padding: "9px 20px",
              border: "none",
              borderRadius: 7,
              background: c.accent,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            บันทึก SO
          </button>
        </div>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: c.ink2,
            }}
          >
            ลูกค้า *
            <input
              value={form.customer}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer: e.target.value }))
              }
              style={panelInput(c.surface, c.border, c.ink)}
            />
          </label>
          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: c.ink2,
            }}
          >
            วันที่
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              style={panelInput(c.surface, c.border, c.ink)}
            />
          </label>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: c.ink2,
            }}
          >
            ช่องทาง
            <select
              value={form.channel}
              onChange={(e) =>
                setForm((f) => ({ ...f, channel: e.target.value }))
              }
              style={panelInput(c.surface, c.border, c.ink)}
            >
              {CHANNELS.map((ch) => (
                <option key={ch}>{ch}</option>
              ))}
            </select>
          </label>
          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: c.ink2,
            }}
          >
            QT อ้างอิง
            <input
              value={form.qtRef}
              onChange={(e) =>
                setForm((f) => ({ ...f, qtRef: e.target.value }))
              }
              style={panelInput(c.surface, c.border, c.ink)}
            />
          </label>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>
            รายการสินค้า
          </span>
          <Btn t={t} variant="ghost" onClick={addLine}>
            + เพิ่มสินค้า
          </Btn>
        </div>
        {form.lines.map((line, i) => {
          const product = products.find((p) => p.sku === line.sku);
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 100px 28px",
                gap: 8,
                alignItems: "center",
              }}
            >
              <select
                value={line.sku}
                onChange={(e) => updateLine(i, "sku", e.target.value)}
                style={panelInput(c.surface, c.border, c.ink)}
              >
                <option value="">-- เลือกสินค้า --</option>
                {products.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={line.qty}
                onChange={(e) =>
                  updateLine(
                    i,
                    "qty",
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                style={panelInput(c.surface, c.border, c.ink)}
              />
              <Mono t={t} size={12}>
                {product ? fmtBaht(product.price * line.qty) : "—"}
              </Mono>
              {form.lines.length > 1 && (
                <button
                  onClick={() => removeLine(i)}
                  style={{
                    border: "none",
                    background: "none",
                    color: c.neg,
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <div
          style={{
            padding: "12px 16px",
            background: c.subtle,
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: c.ink2 }}>รวม</span>
          <Mono t={t} size={18} weight={600}>
            {fmtBaht(lineTotal)}
          </Mono>
        </div>
      </div>
    </SlidePanel>
  );
}

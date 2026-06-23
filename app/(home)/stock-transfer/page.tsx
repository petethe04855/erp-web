"use client";
import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import SlidePanel from "@/components/SlidePanel";
import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar } from "@/components/ui";

const LOCATIONS = [
  "คลังหลัก",
  "ออฟฟิศ",
  "บูธ/งาน",
  "Shopee Fulfillment",
  "Consignment",
  "อื่นๆ",
];
const th: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--erp-ink4)",
  background: "var(--erp-subtle)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: "1px solid var(--erp-border)",
};
const td: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 13,
  borderBottom: "1px solid var(--erp-border)",
  color: "var(--erp-ink2)",
};
const lbl: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--erp-ink2)",
  display: "block",
  marginBottom: 5,
};
const inp: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--erp-border)",
  borderRadius: "var(--erp-radius)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  background: "var(--erp-surface)",
  color: "var(--erp-ink)",
};
const BLANK = {
  sku: "",
  qty: 1,
  fromLocation: "คลังหลัก",
  toLocation: "ออฟฟิศ",
  note: "",
};

export default function StockTransferPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const stockTransfers = useErpStore((s) => s.stockTransfers);
  const createStockTransfer = useErpStore((s) => s.createStockTransfer);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const selectedProduct = products.find((p) => p.sku === form.sku);
  const available = selectedProduct
    ? selectedProduct.stock - selectedProduct.reservedQty
    : 0;
  const isOverStock = !!form.sku && form.qty > available;

  function handleSubmit() {
    if (!form.sku || form.qty < 1 || isOverStock) return;
    if (form.fromLocation === form.toLocation) {
      showToast("ต้นทางและปลายทางต้องไม่เหมือนกัน");
      return;
    }
    const result = createStockTransfer({
      sku: form.sku,
      qty: form.qty,
      fromLocation: form.fromLocation,
      toLocation: form.toLocation,
      note: form.note,
    });
    if (!result) {
      showToast("สต๊อกไม่พอ");
      return;
    }
    setForm(BLANK);
    setOpen(false);
    showToast(
      `โอน ${result.skuName} ${result.qty} ชิ้น: ${result.fromLocation} → ${result.toLocation}`,
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        title="Stock Transfer"
        subtitle="โอนย้ายสินค้าระหว่างสถานที่"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {toast && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: toast.startsWith("โอน") ? c.pos : c.neg,
                  fontFamily: t.font.sans,
                }}
              >
                {toast}
              </span>
            )}
            <button
              onClick={() => setOpen(true)}
              style={{
                padding: "8px 18px",
                background: c.accent,
                color: "#fff",
                border: "none",
                borderRadius: t.radius,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: t.font.sans,
              }}
            >
              + โอนสินค้า
            </button>
          </div>
        }
      />
      <div style={{ padding: "24px 32px" }}>
        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "โอนทั้งหมด",
              value: stockTransfers.length,
              sub: "รายการ",
              color: c.ink,
            },
            {
              label: "ชิ้นที่โอน",
              value: stockTransfers.reduce((s, tr) => s + tr.qty, 0),
              sub: "ชิ้น",
              color: c.info,
            },
            {
              label: "สถานที่ปลายทาง",
              value: new Set(stockTransfers.map((tr) => tr.toLocation)).size,
              sub: "แห่ง",
              color: c.accent,
            },
            {
              label: "โอนวันนี้",
              value: stockTransfers.filter(
                (tr) => tr.date === new Date().toISOString().split("T")[0],
              ).length,
              sub: "รายการ",
              color: c.pos,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="card"
              style={{ padding: "16px 20px" }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: c.ink4,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: t.font.sans,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: item.color,
                  marginTop: 6,
                  fontFamily: t.font.mono,
                }}
              >
                {item.value}
              </div>
              <div
                style={{ fontSize: 12, color: c.ink3, fontFamily: t.font.sans }}
              >
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Transfer history table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid " + c.border,
              fontFamily: t.font.sans,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>
              ประวัติการโอนย้าย
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "เลขที่",
                  "สินค้า",
                  "จำนวน",
                  "จาก",
                  "ไปยัง",
                  "วันที่",
                  "ผู้โอน",
                  "หมายเหตุ",
                ].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockTransfers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      ...td,
                      textAlign: "center",
                      color: c.ink3,
                      padding: 40,
                    }}
                  >
                    ยังไม่มีรายการโอน
                  </td>
                </tr>
              )}
              {stockTransfers.map((tr) => (
                <tr key={tr.id}>
                  <td
                    style={{
                      ...td,
                      fontFamily: t.font.mono,
                      fontSize: 12,
                      color: c.accent,
                      fontWeight: 600,
                    }}
                  >
                    {tr.id}
                  </td>
                  <td style={{ ...td, fontWeight: 500, color: c.ink }}>
                    {tr.skuName}
                  </td>
                  <td
                    style={{
                      ...td,
                      fontWeight: 700,
                      color: c.ink,
                      fontFamily: t.font.mono,
                    }}
                  >
                    {tr.qty} ชิ้น
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: c.subtle,
                        color: c.ink2,
                      }}
                    >
                      {tr.fromLocation}
                    </span>
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: c.infoBg,
                        color: c.info,
                      }}
                    >
                      → {tr.toLocation}
                    </span>
                  </td>
                  <td style={{ ...td, color: c.ink3 }}>{tr.date}</td>
                  <td style={{ ...td, color: c.ink2 }}>{tr.transferredBy}</td>
                  <td
                    style={{
                      ...td,
                      color: c.ink3,
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tr.note || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Panel */}
        <SlidePanel
          open={open}
          onClose={() => setOpen(false)}
          title="โอนสินค้า"
          subtitle="ย้ายสินค้าจากสถานที่หนึ่งไปอีกสถานที่"
          footer={
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "9px 20px",
                  border: "1px solid var(--erp-border)",
                  borderRadius: 7,
                  background: "var(--erp-subtle)",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--erp-ink2)",
                  fontFamily: "var(--erp-font-sans)",
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.sku || isOverStock}
                style={{
                  padding: "9px 20px",
                  border: "none",
                  borderRadius: 7,
                  background:
                    !form.sku || isOverStock
                      ? "var(--erp-subtle)"
                      : "var(--erp-accent)",
                  color: !form.sku || isOverStock ? "var(--erp-ink4)" : "#fff",
                  cursor: !form.sku || isOverStock ? "default" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--erp-font-sans)",
                }}
              >
                บันทึกการโอน
              </button>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={lbl}>สินค้าที่โอน *</label>
              <select
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
                style={inp}
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
              </select>
            </div>
            <div>
              <label style={lbl}>จำนวน *</label>
              <input
                type="number"
                min={1}
                max={available}
                value={form.qty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    qty: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                style={{
                  ...inp,
                  borderColor: isOverStock
                    ? "var(--erp-neg)"
                    : "var(--erp-border)",
                }}
              />
              {isOverStock && (
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 11,
                    color: "var(--erp-neg)",
                  }}
                >
                  เกินสต๊อกที่พร้อมโอน ({available} ชิ้น)
                </p>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "end",
                gap: 12,
              }}
            >
              <div>
                <label style={lbl}>จาก (ต้นทาง)</label>
                <select
                  value={form.fromLocation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fromLocation: e.target.value }))
                  }
                  style={inp}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  paddingBottom: 8,
                  color: "var(--erp-ink3)",
                }}
              >
                →
              </div>
              <div>
                <label style={lbl}>ไปยัง (ปลายทาง)</label>
                <select
                  value={form.toLocation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, toLocation: e.target.value }))
                  }
                  style={{
                    ...inp,
                    borderColor:
                      form.fromLocation === form.toLocation
                        ? "var(--erp-neg)"
                        : "var(--erp-border)",
                  }}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                {form.fromLocation === form.toLocation && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: "var(--erp-neg)",
                    }}
                  >
                    ต้นทางและปลายทางต้องไม่เหมือนกัน
                  </p>
                )}
              </div>
            </div>
            <div>
              <label style={lbl}>หมายเหตุ</label>
              <textarea
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                rows={3}
                placeholder="เช่น ส่งไปบูธงาน Pet Expo 2026"
                style={{ ...inp, resize: "vertical" }}
              />
            </div>
          </div>
        </SlidePanel>
      </div>
    </div>
  );
}

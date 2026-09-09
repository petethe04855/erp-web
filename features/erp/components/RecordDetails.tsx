"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRecord } from "../hooks/useRecord";
import type { Resource } from "../api/recordApi";
import { useAuthStore } from "@/stores/authStore";
import { money, thaiDate, bahtText } from "@/features/orders/types/order";

const actions: Partial<Record<Resource, string[]>> = {
  "sales-orders": ["Completed", "Cancelled"],
  quotations: ["Sent", "Approved", "Rejected"],
  "purchase-orders": ["Sent", "Cancelled"],
};
const fieldLabels: Record<string, string> = {
  id: "ID",
  sku: "รหัสสินค้า (SKU)",
  name: "ชื่อสินค้า",
  type: "ประเภทสินค้า",
  category: "หมวดหมู่",
  barcode: "บาร์โค้ด",
  baseUnit: "หน่วยนับ",
  unit: "หน่วยนับ",
  retailPrice: "ราคาขายปลีก",
  wholesalePrice: "ราคาขายส่ง",
  price: "ราคาขาย",
  cost: "ต้นทุนมาตรฐาน",
  stock: "สต็อกคงเหลือ",
  stockQuantity: "สต็อกคงเหลือ",
  reservedQty: "จำนวนที่จอง",
  available: "สต็อกพร้อมขาย",
  reorder: "จุดสั่งซื้อซ้ำ (Reorder)",
  isBundle: "เป็นสินค้าชุด (Bundle)",
  isActive: "สถานะการใช้งาน",
  status: "สถานะ",
  components: "รายการส่วนประกอบย่อย (Bundle Components)",
  componentSku: "รหัส SKU ส่วนประกอบ",
  bundleSku: "รหัส SKU ชุด",
  qty: "จำนวน",
  note: "หมายเหตุ",
  description: "คำอธิบาย",
  leadSource: "ช่องทางที่มา (Lead source)",
  validUntil: "ใช้ได้ถึง (Valid until)",
  date: "วันที่เอกสาร",
  code: "เลขที่เอกสาร",
  customer: "ลูกค้า",
  amount: "ยอดรวม",
  channel: "ช่องทาง",
  orderRef: "อ้างอิงคำสั่งซื้อ",
};

function formatValue(key: string, val: unknown): React.ReactNode {
  if (val === null || val === undefined || val === "")
    return <span className="text-muted-foreground">—</span>;
  if (typeof val === "boolean") {
    return val ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        ใช่ (Yes)
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        ไม่ใช่ (No)
      </span>
    );
  }
  if (
    key.toLowerCase().includes("price") ||
    key.toLowerCase().includes("cost")
  ) {
    const num = Number(val);
    if (!isNaN(num)) {
      return (
        <span className="font-medium text-foreground">
          ฿
          {num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    }
  }
  if (key === "isActive" || key === "status") {
    const isAct = val === true || val === "active" || val === "Active";
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          isAct
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        }`}
      >
        {String(val)}
      </span>
    );
  }
  if (key === "channel") {
    const s = String(val).toUpperCase().trim();
    if (s.includes("TIKTOK")) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">TikTok</span>;
    if (s.includes("SHOPEE")) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">Shopee</span>;
    if (s.includes("MANUAL") || s === "ORDER") return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Manual</span>;
    return <span className="text-foreground font-medium">{String(val)}</span>;
  }
  return <span className="text-foreground font-medium">{String(val)}</span>;
}

function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "")
    return <span className="text-muted-foreground">—</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <p className="text-muted-foreground italic text-xs">
          ไม่มีรายการส่วนประกอบ
        </p>
      );
    }
    return (
      <div className="space-y-2 mt-1">
        {value.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border bg-card p-3 shadow-sm text-left"
          >
            {typeof item === "object" && item !== null ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(item).map(([ik, iv]) => (
                  <div key={ik} className="flex flex-col">
                    <span className="text-muted-foreground text-[11px]">
                      {fieldLabels[ik] || ik}
                    </span>
                    <span className="font-medium">{formatValue(ik, iv)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Value value={item} />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value);
    const regularEntries = entries.filter(([k]) => k !== "components");
    const componentsEntry = entries.find(([k]) => k === "components");

    return (
      <div className="space-y-4 text-left">
        <div className="divide-y divide-border/60 rounded-lg border bg-card text-xs shadow-sm">
          {regularEntries.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-muted/30 transition-colors text-left"
            >
              <div className="col-span-5 sm:col-span-4 text-muted-foreground font-medium pr-2 text-left">
                {fieldLabels[k] || k}
              </div>
              <div className="col-span-7 sm:col-span-8 text-left break-words">
                {formatValue(k, v)}
              </div>
            </div>
          ))}
        </div>

        {componentsEntry && (
          <div className="pt-2 text-left">
            <h4 className="font-semibold text-xs text-foreground mb-2 text-left flex items-center gap-1.5">
              <span>📦</span> {fieldLabels.components}
            </h4>
            <Value value={componentsEntry[1]} />
          </div>
        )}
      </div>
    );
  }

  return <span className="text-foreground text-left">{String(value)}</span>;
}
export function RecordDetails({
  resource,
  id,
}: {
  resource: Resource;
  id: string | number;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { query, mutation } = useRecord(resource, id, open);
  const role = useAuthStore((s) => s.user?.role);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        รายละเอียด
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          role="dialog"
          aria-modal="true"
          aria-label="รายละเอียดรายการ"
          onClose={() => setOpen(false)}
          className="max-h-[85vh] max-w-2xl overflow-auto text-left"
        >
          <DialogTitle className="text-left font-semibold text-base">
            รายละเอียด {query.data?.code || String(id)}
          </DialogTitle>
          {query.isPending ? (
            <p className="py-6 text-sm">กำลังโหลด…</p>
          ) : query.isError ? (
            <p role="alert">{query.error.message}</p>
          ) : (
            <div className="my-6 text-xs">
              <Value value={query.data} />
            </div>
          )}
          {query.data && (
            <div className="space-y-3 border-t pt-4">
              {resource === "sales-orders" && (query.data?.status === "Completed" || query.data?.status === "COMPLETED" || query.data?.status === "SHIPPED") ? (
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90"
                    onClick={async () => {
                      try {
                        const html2pdf = (await import("html2pdf.js")).default;
                        const element = document.getElementById(`so-print-template-${query.data?.id}`);
                        if (!element) {
                          alert("ไม่พบแบบฟอร์มเอกสารใบสั่งขายสำหรับ Export PDF");
                          return;
                        }
                        await html2pdf()
                          .set({
                            margin: 0,
                            filename: `${query.data?.code || "sales-order"}.pdf`,
                            image: { type: "jpeg", quality: 0.98 },
                            html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
                            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                          })
                          .from(element)
                          .save();
                      } catch (err: any) {
                        alert("Export PDF ไม่สำเร็จ: " + (err?.message || String(err)));
                      }
                    }}
                  >
                    📄 Export PDF (ใบสั่งขาย)
                  </Button>
                </div>
              ) : (
                (() => {
                  let availableStatuses = actions[resource] || [];
                  if (resource === "quotations") {
                    const currentStatus = String(query.data?.status || "Draft").toUpperCase();
                    if (currentStatus === "DRAFT" || !currentStatus) {
                      // ตอนเริ่มต้นแสดงเฉพาะปุ่ม Sent
                      availableStatuses = ["Sent"];
                    } else if (currentStatus === "SENT") {
                      // เมื่อกด Sent แล้ว จึงแสดงปุ่ม Approved และ Rejected
                      availableStatuses = ["Approved", "Rejected"];
                    } else {
                      // Approved หรือสถานะอื่น ไม่ต้องแสดงปุ่มเปลี่ยนสถานะเพิ่มเติม
                      availableStatuses = [];
                    }
                  }
                  return availableStatuses
                    .filter((s) => s.toUpperCase() !== String(query.data?.status || "").toUpperCase() && (s.toUpperCase() !== "COMPLETED" || String(query.data?.status || "").toUpperCase() !== "SHIPPED"))
                    .map((status) => (
                      <Button
                        key={status}
                        className="mr-2"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => {
                          if (
                            window.confirm("ยืนยันเปลี่ยนสถานะเป็น " + status + "?")
                          )
                            mutation.mutate({ status });
                        }}
                      >
                        {status}
                      </Button>
                    ));
                })()
              )}
              {resource === "quotations" && (
                <Button
                  className="mr-2 bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90"
                  onClick={async () => {
                    try {
                      const html2pdf = (await import("html2pdf.js")).default;
                      const element = document.getElementById(`quotation-print-template-${query.data?.id}`);
                      if (!element) {
                        alert("ไม่พบแบบฟอร์มเอกสารใบเสนอราคาสำหรับ Export PDF");
                        return;
                      }
                      await html2pdf()
                        .set({
                          margin: 0,
                          filename: `${query.data?.code || "quotation"}.pdf`,
                          image: { type: "jpeg", quality: 0.98 },
                          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
                          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                        })
                        .from(element)
                        .save();
                    } catch (err: any) {
                      alert("Export PDF ไม่สำเร็จ: " + (err?.message || String(err)));
                    }
                  }}
                >
                  📄 Export PDF (ใบเสนอราคา)
                </Button>
              )}
              {resource === "quotations" &&
                (query.data.status === "Sent" ||
                  query.data.status === "Approved") && (
                  <Button
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ convert: true })}
                  >
                    แปลงเป็นใบสั่งขาย
                  </Button>
                )}
              {resource === "invoices" && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    className="bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90"
                    onClick={async () => {
                      try {
                        const html2pdf = (await import("html2pdf.js")).default;
                        const element = document.getElementById(`invoice-print-template-${query.data?.id}`);
                        if (!element) {
                          alert("ไม่พบแบบฟอร์มเอกสารใบแจ้งหนี้สำหรับ Export PDF");
                          return;
                        }
                        await html2pdf()
                          .set({
                            margin: 0,
                            filename: `${query.data?.code || query.data?.invoiceNo || "invoice"}.pdf`,
                            image: { type: "jpeg", quality: 0.98 },
                            html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
                            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                          })
                          .from(element)
                          .save();
                      } catch (err: any) {
                        alert("Export PDF ไม่สำเร็จ: " + (err?.message || String(err)));
                      }
                    }}
                  >
                    📄 Export PDF (ใบแจ้งหนี้)
                  </Button>
                  {(role === "owner" ||
                    role === "admin" ||
                    role === "accountant") && query.data?.status !== "PAID" && (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate({ amount: Number(amount) });
                      }}
                    >
                      <Input
                        aria-label="จำนวนเงินรับชำระ"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="ยอดรับชำระ"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <Button disabled={mutation.isPending}>รับชำระ</Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
          {mutation.error && (
            <p role="alert" className="text-sm mt-3">
              {mutation.error.message}
            </p>
          )}
          {mutation.isSuccess && (
            <p role="status" className="text-sm mt-3">
              บันทึกสำเร็จ
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden A4 Print Template for Sales Order (Matches erp-web) */}
      {resource === "sales-orders" && query.data && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <section
            id={`so-print-template-${query.data.id}`}
            style={{
              width: "794px",
              minHeight: "1122px",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
              color: "#1f2937",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontFamily: "sans-serif",
            }}
          >
            <div>
              {/* Header */}
              <header style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #1f2937", paddingBottom: "16px" }}>
                <div style={{ display: "flex", gap: "12px", maxWidth: "450px" }}>
                  <img
                    src="/assets/images/company-logo.jpg"
                    alt="Chawy ERP"
                    crossOrigin="anonymous"
                    style={{ width: "72px", height: "auto", objectFit: "contain" }}
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#374151" }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827" }}>
                      Chawy Co., Ltd. (สำนักงานใหญ่)
                    </div>
                    <div>123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</div>
                    <div>เลขประจำตัวผู้เสียภาษี 0105560000000</div>
                    <div>โทร 02-123-4567 · info@chawy.com</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: "250px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>
                    ใบสั่งขาย
                  </h1>
                  <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#6b7280", marginTop: "4px" }}>
                    SALES ORDER · ต้นฉบับ
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "11px", display: "grid", gridTemplateColumns: "70px 1fr", rowGap: "4px", textAlign: "left" }}>
                    <span style={{ color: "#374151" }}>เลขที่</span>
                    <b>{String(query.data.code || query.data.id)}</b>
                    <span style={{ color: "#374151" }}>วันที่</span>
                    <span>{thaiDate(String(query.data.date || ""))}</span>
                    <span style={{ color: "#374151" }}>ช่องทาง</span>
                    <span>{String(query.data.channel || "Direct")}</span>
                    <span style={{ color: "#374151" }}>สถานะ</span>
                    <span style={{ fontWeight: 600, color: "#059669" }}>{String(query.data.status)}</span>
                  </div>
                </div>
              </header>

              {/* Customer Info */}
              <div style={{ marginTop: "24px", borderBottom: "1px solid #d1d5db", paddingBottom: "16px", fontSize: "11px" }}>
                <div style={{ fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>ลูกค้า</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>
                  {String(query.data.customer || "–")}
                </div>
                <div style={{ marginTop: "4px", color: "#4b5563" }}>
                  {query.data.customerAddress ? String(query.data.customerAddress) : "สำนักงานใหญ่ / สถานที่จัดส่งตามที่ระบุ"}
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ marginTop: "24px", width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", borderTop: "2px solid #6b7280", borderBottom: "2px solid #6b7280", height: "36px" }}>
                    <th style={{ width: "8%", padding: "8px", textAlign: "center" }}>#</th>
                    <th style={{ width: "46%", padding: "8px", textAlign: "left" }}>รายละเอียดสินค้า</th>
                    <th style={{ width: "12%", padding: "8px", textAlign: "right" }}>จำนวน</th>
                    <th style={{ width: "16%", padding: "8px", textAlign: "right" }}>ราคาต่อหน่วย</th>
                    <th style={{ width: "18%", padding: "8px", textAlign: "right" }}>มูลค่า</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(query.data.lines) && (query.data.lines as any[]).length > 0 ? (
                    (query.data.lines as any[]).map((line, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "10px 8px", textAlign: "center", color: "#6b7280" }}>{idx + 1}</td>
                        <td style={{ padding: "10px 8px", textAlign: "left" }}>
                          <div style={{ fontWeight: "bold", color: "#111827" }}>{line.name || line.sku}</div>
                          <div style={{ fontSize: "10px", color: "#6b7280", fontFamily: "monospace" }}>{line.sku}</div>
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>{line.quantity || line.qty}</td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>{money(Number(line.unitPrice || line.price || 0))}</td>
                        <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{money(Number(line.subtotal || (line.quantity * line.unitPrice) || 0))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "10px 8px", textAlign: "left" }}>
                        <div style={{ fontWeight: "bold" }}>รายการสั่งซื้อสินค้า</div>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{Number(query.data.items || 1)}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{money(Number(query.data.amount || 0))}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{money(Number(query.data.amount || 0))}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Totals & Signatures */}
            <div style={{ marginTop: "40px" }}>
              {(() => {
                const total = Number(query.data.amount || 0);
                const hasVat = query.data.includeVat !== false && !String(query.data.note || "").includes("VAT_INC:false");
                const vatRate = hasVat ? 7 : 0;
                const beforeVat = hasVat ? total / 1.07 : total;
                const vat = hasVat ? total - beforeVat : 0;

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", fontSize: "12px" }}>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#111827" }}>หมายเหตุ</div>
                      <div style={{ marginTop: "6px", color: "#4b5563" }}>
                        การชำระเงิน: ตามกำหนดในใบแจ้งหนี้
                      </div>
                      <div style={{ color: "#4b5563" }}>
                        การส่งมอบ: ดำเนินการจัดส่งเรียบร้อยแล้ว (Completed)
                      </div>
                    </div>
                    <div style={{ borderTop: "2px solid #111827", paddingTop: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>ราคาสินค้าก่อนภาษี</span>
                        <span>{money(beforeVat)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
                        <span>{money(vat)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #111827", paddingTop: "8px", fontSize: "15px", fontWeight: "bold", color: "#111827" }}>
                        <span>จำนวนเงินรวมทั้งสิ้น</span>
                        <span>{money(total)}</span>
                      </div>
                      <div style={{ textAlign: "center", fontSize: "11px", color: "#4b5563", marginTop: "4px" }}>
                        ({bahtText(total)})
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ marginTop: "50px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", textAlign: "center", fontSize: "11px" }}>
                <div>
                  <div style={{ marginBottom: "40px", color: "#374151" }}>ผู้รับสินค้า / ผู้ซื้อ</div>
                  <div style={{ borderBottom: "1px solid #9ca3af" }} />
                  <div style={{ marginTop: "8px", color: "#6b7280" }}>วันที่ _____ / _____ / _________</div>
                </div>
                <div>
                  <div style={{ marginBottom: "40px", color: "#374151" }}>ผู้อนุมัติ / ผู้ขาย</div>
                  <div style={{ borderBottom: "1px solid #9ca3af" }} />
                  <div style={{ marginTop: "8px", color: "#6b7280" }}>วันที่ _____ / _____ / _________</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Hidden A4 Print Template for Quotation (Matches erp-web) */}
      {resource === "quotations" && query.data && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <section
            id={`quotation-print-template-${query.data.id}`}
            style={{
              width: "794px",
              minHeight: "1122px",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
              color: "#1f2937",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontFamily: "sans-serif",
            }}
          >
            <div>
              {/* Header */}
              <header style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #1f2937", paddingBottom: "16px" }}>
                <div style={{ display: "flex", gap: "12px", maxWidth: "450px" }}>
                  <img
                    src="/assets/images/company-logo.jpg"
                    alt="Chawy ERP"
                    crossOrigin="anonymous"
                    style={{ width: "72px", height: "auto", objectFit: "contain" }}
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#374151" }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827" }}>
                      Chawy Co., Ltd. (สำนักงานใหญ่)
                    </div>
                    <div>123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</div>
                    <div>เลขประจำตัวผู้เสียภาษี 0105560000000</div>
                    <div>โทร 02-123-4567 · info@chawy.com</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: "250px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>
                    ใบเสนอราคา
                  </h1>
                  <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#6b7280", marginTop: "4px" }}>
                    QUOTATION · ต้นฉบับ
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "11px", display: "grid", gridTemplateColumns: "70px 1fr", rowGap: "4px", textAlign: "left" }}>
                    <span style={{ color: "#374151" }}>เลขที่</span>
                    <b>{String(query.data.code || query.data.id)}</b>
                    <span style={{ color: "#374151" }}>วันที่</span>
                    <span>{thaiDate(String(query.data.date || ""))}</span>
                    <span style={{ color: "#374151" }}>เครดิต</span>
                    <span>
                      {(() => {
                        const vUntil = String(query.data.validUntil || "");
                        const dDate = String(query.data.date || "");
                        if (!vUntil || !dDate) return "15 วัน";
                        const diff = Math.round(
                          (new Date(vUntil).getTime() - new Date(dDate).getTime()) / 86400000
                        );
                        return `${Math.max(0, isNaN(diff) ? 15 : diff)} วัน`;
                      })()}
                    </span>
                    <span style={{ color: "#374151" }}>ผู้ขาย</span>
                    <span>{String(query.data.seller || query.data.createdBy || (useAuthStore.getState().user?.name || "User"))}</span>
                    <span style={{ color: "#374151" }}>ชื่องาน</span>
                    <span>{String(query.data.leadSource || query.data.project || "–")}</span>
                  </div>
                </div>
              </header>

              {/* Customer Info */}
              <div style={{ marginTop: "24px", borderBottom: "1px solid #d1d5db", paddingBottom: "16px", fontSize: "11px" }}>
                <div style={{ fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>ลูกค้า</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>
                  {String(query.data.customer || query.data.customerName || "–")}
                </div>
                <div style={{ marginTop: "4px", color: "#4b5563" }}>
                  {query.data.customerAddress ? String(query.data.customerAddress) : "สำนักงานใหญ่ / สถานที่จัดส่งตามที่ระบุ"}
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ marginTop: "24px", width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", borderTop: "2px solid #6b7280", borderBottom: "2px solid #6b7280", height: "36px" }}>
                    <th style={{ width: "8%", padding: "8px", textAlign: "center" }}>#</th>
                    <th style={{ width: "46%", padding: "8px", textAlign: "left" }}>รายละเอียดสินค้า</th>
                    <th style={{ width: "12%", padding: "8px", textAlign: "right" }}>จำนวน</th>
                    <th style={{ width: "16%", padding: "8px", textAlign: "right" }}>ราคาต่อหน่วย</th>
                    <th style={{ width: "18%", padding: "8px", textAlign: "right" }}>มูลค่า</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(query.data.lines) && (query.data.lines as any[]).length > 0 ? (
                    (query.data.lines as any[]).map((line, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "10px 8px", textAlign: "center", color: "#6b7280" }}>{idx + 1}</td>
                        <td style={{ padding: "10px 8px", textAlign: "left" }}>
                          <div style={{ fontWeight: "bold", color: "#111827" }}>{line.name || line.sku}</div>
                          <div style={{ fontSize: "10px", color: "#6b7280", fontFamily: "monospace" }}>{line.sku}</div>
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>{line.qty || line.quantity}</td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>{money(Number(line.price || line.unitPrice || 0))}</td>
                        <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{money(Number(line.subtotal || ((line.qty || line.quantity) * (line.price || line.unitPrice)) || 0))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "10px 8px", textAlign: "left" }}>
                        <div style={{ fontWeight: "bold" }}>รายการสินค้าในใบเสนอราคา</div>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>1</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{money(Number(query.data.amount || query.data.totalAmount || 0))}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{money(Number(query.data.amount || query.data.totalAmount || 0))}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Totals & Signatures */}
            <div style={{ marginTop: "40px" }}>
              {(() => {
                const total = Number(query.data.amount || query.data.totalAmount || 0);
                const vatRate = 7;
                const beforeVat = total / 1.07;
                const vat = total - beforeVat;

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", fontSize: "12px" }}>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#111827" }}>หมายเหตุ</div>
                      <div style={{ marginTop: "6px", color: "#4b5563" }}>
                        ราคานี้ยืนยันความถูกต้องตามวันที่ระบุในเอกสาร
                      </div>
                      <div style={{ color: "#4b5563" }}>
                        {String(query.data.note || "เงื่อนไขการชำระเงินตามที่ตกลง")}
                      </div>
                    </div>
                    <div style={{ borderTop: "2px solid #111827", paddingTop: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>ราคาสินค้าก่อนภาษี</span>
                        <span>{money(beforeVat)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
                        <span>{money(vat)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #111827", paddingTop: "8px", fontSize: "15px", fontWeight: "bold", color: "#111827" }}>
                        <span>จำนวนเงินรวมทั้งสิ้น</span>
                        <span>{money(total)}</span>
                      </div>
                      <div style={{ textAlign: "center", fontSize: "11px", color: "#4b5563", marginTop: "4px" }}>
                        ({bahtText(total)})
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ marginTop: "50px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", textAlign: "center", fontSize: "11px" }}>
                <div>
                  <div style={{ marginBottom: "40px", color: "#374151" }}>ผู้สั่งซื้อสินค้า / ผู้รับใบเสนอราคา</div>
                  <div style={{ borderBottom: "1px solid #9ca3af" }} />
                  <div style={{ marginTop: "8px", color: "#6b7280" }}>วันที่ _____ / _____ / _________</div>
                </div>
                <div>
                  <div style={{ marginBottom: "40px", color: "#374151" }}>ผู้อนุมัติ / ผู้เสนอราคา</div>
                  <div style={{ borderBottom: "1px solid #9ca3af" }} />
                  <div style={{ marginTop: "8px", color: "#6b7280" }}>วันที่ _____ / _____ / _________</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Hidden A4 Print Template for Invoice (Matches erp-web) */}
      {resource === "invoices" && query.data && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <section
            id={`invoice-print-template-${query.data.id}`}
            style={{
              width: "794px",
              minHeight: "1122px",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
              color: "#1f2937",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontFamily: "sans-serif",
            }}
          >
            <div>
              {/* Header */}
              <header style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #1f2937", paddingBottom: "16px" }}>
                <div style={{ display: "flex", gap: "12px", maxWidth: "450px" }}>
                  <img
                    src="/assets/images/company-logo.jpg"
                    alt="Chawy ERP"
                    crossOrigin="anonymous"
                    style={{ width: "72px", height: "auto", objectFit: "contain" }}
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#374151" }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827" }}>
                      Chawy Co., Ltd. (สำนักงานใหญ่)
                    </div>
                    <div>123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</div>
                    <div>เลขประจำตัวผู้เสียภาษี 0105560000000</div>
                    <div>โทร 02-123-4567 · info@chawy.com</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: "250px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>
                    ใบแจ้งหนี้
                  </h1>
                  <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#6b7280", marginTop: "4px" }}>
                    INVOICE · ต้นฉบับ
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "11px", display: "grid", gridTemplateColumns: "70px 1fr", rowGap: "4px", textAlign: "left" }}>
                    <span style={{ color: "#374151" }}>เลขที่</span>
                    <b>{String(query.data.code || query.data.invoiceNo || query.data.id)}</b>
                    <span style={{ color: "#374151" }}>วันที่</span>
                    <span>{thaiDate(String(query.data.issueDate || query.data.date || ""))}</span>
                    <span style={{ color: "#374151" }}>ครบกำหนด</span>
                    <span>{thaiDate(String(query.data.dueDate || ""))}</span>
                    <span style={{ color: "#374151" }}>อ้างอิง SO</span>
                    <span>{String(query.data.soRef || query.data.orderNo || "–")}</span>
                    <span style={{ color: "#374151" }}>สถานะ</span>
                    <span style={{ fontWeight: 600, color: query.data.status === "PAID" ? "#059669" : "#d97706" }}>
                      {String(query.data.status || "UNPAID")}
                    </span>
                  </div>
                </div>
              </header>

              {/* Customer Info */}
              <div style={{ marginTop: "24px", borderBottom: "1px solid #d1d5db", paddingBottom: "16px", fontSize: "11px" }}>
                <div style={{ fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>ลูกค้า</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>
                  {String(query.data.customer || query.data.customerName || "–")}
                </div>
                <div style={{ marginTop: "4px", color: "#4b5563" }}>
                  {query.data.customerAddress ? String(query.data.customerAddress) : "สำนักงานใหญ่ / สถานที่จัดส่งตามที่ระบุ"}
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ marginTop: "24px", width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", borderTop: "2px solid #6b7280", borderBottom: "2px solid #6b7280", height: "36px" }}>
                    <th style={{ width: "8%", padding: "8px", textAlign: "center" }}>#</th>
                    <th style={{ width: "46%", padding: "8px", textAlign: "left" }}>รายละเอียด</th>
                    <th style={{ width: "12%", padding: "8px", textAlign: "right" }}>จำนวน</th>
                    <th style={{ width: "16%", padding: "8px", textAlign: "right" }}>ราคาต่อหน่วย</th>
                    <th style={{ width: "18%", padding: "8px", textAlign: "right" }}>มูลค่า</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(query.data.lines) && (query.data.lines as any[]).length > 0 ? (
                    (query.data.lines as any[]).map((line, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "10px 8px", textAlign: "center", color: "#6b7280" }}>{idx + 1}</td>
                        <td style={{ padding: "10px 8px", textAlign: "left" }}>
                          <div style={{ fontWeight: "bold", color: "#111827" }}>{line.name || line.sku}</div>
                          <div style={{ fontSize: "10px", color: "#6b7280", fontFamily: "monospace" }}>{line.sku}</div>
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>{line.qty || line.quantity}</td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>{money(Number(line.price || line.unitPrice || 0))}</td>
                        <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{money(Number(line.subtotal || ((line.qty || line.quantity) * (line.price || line.unitPrice)) || 0))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>1</td>
                      <td style={{ padding: "10px 8px", textAlign: "left" }}>
                        <div style={{ fontWeight: "bold" }}>ยอดเรียกเก็บตามใบสั่งขาย {String(query.data.soRef || query.data.orderNo || "")}</div>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>1</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{money(Number(query.data.amount || query.data.totalAmount || 0))}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{money(Number(query.data.amount || query.data.totalAmount || 0))}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Totals & Signatures */}
            <div style={{ marginTop: "40px" }}>
              {(() => {
                const total = Number(query.data.amount || query.data.totalAmount || 0);
                const vatRate = 7;
                const beforeVat = total / 1.07;
                const vat = total - beforeVat;

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", fontSize: "12px" }}>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#111827" }}>เงื่อนไขการชำระเงิน</div>
                      <div style={{ marginTop: "6px", color: "#4b5563" }}>
                        โอนเงินเข้าบัญชีธนาคาร: กสิกรไทย 123-4-56789-0 (บจก. ชาวยี่)
                      </div>
                      <div style={{ color: "#4b5563" }}>
                        วิธีการชำระ: {String(query.data.paymentMethod || "Bank Transfer")}
                      </div>
                      <div style={{ color: "#4b5563" }}>
                        {query.data.status === "PAID" ? "ชำระเงินเรียบร้อยแล้ว (Paid)" : "กรุณาชำระเงินภายในวันที่ครบกำหนด"}
                      </div>
                    </div>
                    <div style={{ borderTop: "2px solid #111827", paddingTop: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>ราคาสินค้าก่อนภาษี</span>
                        <span>{money(beforeVat)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
                        <span>{money(vat)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #111827", paddingTop: "8px", fontSize: "15px", fontWeight: "bold", color: "#111827" }}>
                        <span>จำนวนเงินรวมทั้งสิ้น</span>
                        <span>{money(total)}</span>
                      </div>
                      <div style={{ textAlign: "center", fontSize: "11px", color: "#4b5563", marginTop: "4px" }}>
                        ({bahtText(total)})
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ marginTop: "50px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", textAlign: "center", fontSize: "11px" }}>
                <div>
                  <div style={{ marginBottom: "40px", color: "#374151" }}>ผู้รับวางบิล / ผู้จ่ายเงิน</div>
                  <div style={{ borderBottom: "1px solid #9ca3af" }} />
                  <div style={{ marginTop: "8px", color: "#6b7280" }}>วันที่ _____ / _____ / _________</div>
                </div>
                <div>
                  <div style={{ marginBottom: "40px", color: "#374151" }}>ผู้ออกเอกสาร / ผู้รับเงิน</div>
                  <div style={{ borderBottom: "1px solid #9ca3af" }} />
                  <div style={{ marginTop: "8px", color: "#6b7280" }}>วันที่ _____ / _____ / _________</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

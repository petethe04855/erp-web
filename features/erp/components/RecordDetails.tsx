"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRecord } from "../hooks/useRecord";
import type { Resource } from "../api/recordApi";
import { useAuthStore } from "@/stores/authStore";
import { getImageUrl } from "@/lib/utils";
import { downloadBackendPdf } from "@/lib/pdfDownload";

function pdfErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

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
  image: "รูปภาพสินค้า",
  logo: "รูปภาพบริษัท / โลโก้",
  customerLogo: "โลโก้ลูกค้า",
  poRef: "อ้างอิงใบสั่งซื้อ (PO Ref)",
  receiveDate: "วันที่รับสินค้า",
  supplier: "ผู้จัดจำหน่าย",
  itemsCount: "จำนวนรายการ",
  lines: "รายการสินค้า (Line Items)",
  receivedQty: "จำนวนที่รับเข้า",
  unitCost: "ราคาต้นทุนต่อหน่วย (บาท)",
  supplierLot: "ล็อตผู้จัดจำหน่าย",
  expiryDate: "วันหมดอายุ",
  qcStatus: "ผลตรวจ QC",
};

function formatValue(key: string, val: unknown): React.ReactNode {
  if (val === null || val === undefined || val === "")
    return <span className="text-muted-foreground">—</span>;
  if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
    return <Value value={val} />;
  }
  if ((key === "image" || key === "logo" || key === "customerLogo") && typeof val === "string") {
    return (
      <div className="my-1">
        <div className="h-24 w-24 rounded-lg overflow-hidden border border-border bg-muted/40 flex items-center justify-center p-1">
          <img
            src={getImageUrl(val)}
            alt={key === "image" ? "Product" : "Company Logo"}
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>
    );
  }
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
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isAct
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
          ไม่มีรายการย่อย
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
                {Object.entries(item)
                  .filter(([ik]) => ik !== "id")
                  .map(([ik, iv]) => (
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
    const regularEntries = entries.filter(
      ([k]) => k !== "components" && k !== "lines" && k !== "id"
    );
    const componentsEntry = entries.find(([k]) => k === "components");
    const linesEntry = entries.find(([k]) => k === "lines");

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

        {linesEntry && (
          <div className="pt-2 text-left">
            <h4 className="font-semibold text-xs text-foreground mb-2 text-left flex items-center gap-1.5">
              <span>📋</span> {fieldLabels.lines || "รายการสินค้า"}
            </h4>
            <Value value={linesEntry[1]} />
          </div>
        )}

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
  const [exporting, setExporting] = useState(false);
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
                    disabled={exporting}
                    onClick={async () => {
                      if (exporting) return;
                      setExporting(true);
                      try {
                        await downloadBackendPdf("sales-orders", query.data?.id, `${query.data?.code || "sales-order"}.pdf`);
                      } catch (err) {
                        alert("Export PDF ไม่สำเร็จ: " + pdfErrorMessage(err));
                      } finally {
                        setExporting(false);
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
                  } else if (resource === "sales-orders") {
                    const currentStatus = String(query.data?.status || "PENDING").toUpperCase();
                    if (currentStatus === "PENDING") {
                      availableStatuses = ["Confirmed", "Cancelled"];
                    } else if (currentStatus === "CONFIRMED") {
                      availableStatuses = ["Completed", "Cancelled"];
                    } else {
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
              {mutation.isError && (
                <p className="text-sm text-destructive font-medium mt-2" role="alert">
                  {mutation.error instanceof Error ? mutation.error.message : "เกิดข้อผิดพลาดในการอัปเดต"}
                </p>
              )}
              {resource === "quotations" && (
                <Button
                  className="mr-2 bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90"
                  disabled={exporting}
                  onClick={async () => {
                    if (exporting) return;
                    setExporting(true);
                    try {
                      await downloadBackendPdf("quotations", query.data?.id, `${query.data?.code || "quotation"}.pdf`);
                    } catch (err) {
                      alert("Export PDF ไม่สำเร็จ: " + pdfErrorMessage(err));
                    } finally {
                      setExporting(false);
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
                    disabled={exporting}
                    onClick={async () => {
                      if (exporting) return;
                      setExporting(true);
                      try {
                        await downloadBackendPdf("invoices", query.data?.id, `${query.data?.code || query.data?.invoiceNo || "invoice"}.pdf`);
                      } catch (err) {
                        alert("Export PDF ไม่สำเร็จ: " + pdfErrorMessage(err));
                      } finally {
                        setExporting(false);
                      }
                    }}
                  >
                    📄 Export PDF (ใบแจ้งหนี้)
                  </Button>
                  {(role === "owner" || role === "accountant") &&
                    query.data?.status !== "PAID" && (
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
    </>
  );
}

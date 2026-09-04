"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useErpStore } from "@/lib/store/useErpStore";
import type { Invoice } from "@/lib/store/erpWorkflow";
import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar } from "@/components/ui";
import { Card } from "@/components/ui/card";
import {
  CustomerMetrics,
  InvoicesTable,
  InvoicePrintTemplate,
} from "./components";
import {
  balance,
  templateId,
  today,
  type DisplayLine,
} from "./components/types";

export default function CustomerInvoiceDetailPage() {
  const { tokens: t } = useTheme();
  const invoices = useErpStore((state) => state.invoices);
  const salesOrders = useErpStore((state) => state.salesOrders);
  const products = useErpStore((state) => state.products);
  const settings = useErpStore((state) => state.settings);
  const [customer, setCustomer] = useState("");
  const [toast, setToast] = useState("");

  useEffect(
    () => setCustomer(new URLSearchParams(window.location.search).get("name") || ""),
    [],
  );

  const customerInvoices = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.customer === customer && balance(invoice) > 0)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [invoices, customer],
  );

  const totals = useMemo(
    () => ({
      original: customerInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      credited: customerInvoices.reduce((sum, inv) => sum + (inv.credited ?? 0), 0),
      paid: customerInvoices.reduce((sum, inv) => sum + inv.paid, 0),
      outstanding: customerInvoices.reduce((sum, inv) => sum + balance(inv), 0),
      overdue: customerInvoices
        .filter((inv) => inv.dueDate < today())
        .reduce((sum, inv) => sum + balance(inv), 0),
    }),
    [customerInvoices],
  );

  const orderFor = (invoice: Invoice) =>
    salesOrders.find(
      (order) =>
        (invoice.salesOrderId != null &&
          String(order.id) === String(invoice.salesOrderId)) ||
        String(order.id) === String(invoice.soRef) ||
        String(order.code) === String(invoice.soRef),
    );

  const productLines = (invoice: Invoice): DisplayLine[] => {
    if (invoice.lines?.length) {
      return invoice.lines.map((line, index) => ({
        key: line.id ?? `${line.sku}-${index}`,
        sku: line.sku,
        lot: line.lot || "UNSPECIFIED",
        name: line.name,
        qty: line.qty,
        unit: line.unit || "ชิ้น",
        unitPrice: line.unitPrice,
        discount: line.discount || 0,
        total: line.lineTotal,
      }));
    }
    const order = orderFor(invoice);
    return (
      order?.lines?.map((line, index) => {
        const prod = products.find((p) => p.sku === line.sku);
        return {
          key: line.id ?? `${line.sku}-${index}`,
          sku: line.sku,
          lot: "UNSPECIFIED",
          name: prod?.name || line.sku,
          qty: line.qty,
          unit: (prod as any)?.unit || "ชิ้น",
          unitPrice: line.unitPrice ?? 0,
          discount: 0,
          total: line.lineTotal ?? (line.unitPrice ?? 0) * line.qty,
        };
      }) ?? []
    );
  };

  async function exportForm(invoice: Invoice) {
    const element = document.getElementById(templateId(invoice.id));
    if (!element) {
      setToast("ไม่พบข้อมูลแบบฟอร์ม Invoice");
      return;
    }
    try {
      setToast("กำลังเตรียมดาวน์โหลด PDF...");
      const html2pdf = (await import("html2pdf.js")).default;

      // Clone element to fixed container to prevent html2canvas coordinate clipping
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-99999";
      clone.style.visibility = "visible";
      clone.style.display = "block";
      document.body.appendChild(clone);

      const opt = {
        margin: 0,
        filename: `${invoice.code || invoice.id}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          width: 794,
          height: 1110,
          windowWidth: 794,
          windowHeight: 1110,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      try {
        await html2pdf().set(opt).from(clone).save();
        setToast("Export ใบแจ้งหนี้สำเร็จ");
      } finally {
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
      }
    } catch (err) {
      console.error(err);
      setToast("Export ใบแจ้งหนี้ไม่สำเร็จ");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: t.color.canvas }}>
      <TopBar
        t={t}
        title={customer || "รายละเอียดลูกค้า"}
        subtitle="รายการใบแจ้งหนี้ค้างชำระ"
        breadcrumb={["Chawy", "Invoices", "รายละเอียดลูกค้า", customer || "–"]}
        right={
          <div className="flex items-center gap-3">
            {toast && <span className="text-sm text-emerald-600">{toast}</span>}
            <Link
              href="/invoice"
              className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
            >
              ← กลับหน้า Invoice
            </Link>
          </div>
        }
      />
      <main className="space-y-5 p-4 md:p-8">
        {!customer ? (
          <Card className="p-6 text-center text-muted-foreground">
            ไม่พบชื่อลูกค้าใน URL
          </Card>
        ) : (
          <>
            <Card className="border-l-4 border-l-[var(--erp-accent)] p-5">
              <div className="text-xs text-muted-foreground">ข้อมูลลูกค้า</div>
              <div className="mt-1 text-2xl font-bold">{customer}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Invoice ค้างชำระ {customerInvoices.length} ใบ · หนึ่ง Invoice
                ต่อหนึ่งเอกสาร
              </div>
            </Card>

            <CustomerMetrics totals={totals} />

            <InvoicesTable
              invoices={customerInvoices}
              productLines={productLines}
              orderFor={orderFor}
              onExport={exportForm}
            />

            {/* Hidden A4 Invoice Print Templates */}
            <div
              style={{
                position: "fixed",
                left: "-9999px",
                top: "0",
                pointerEvents: "none",
              }}
            >
              {customerInvoices.map((invoice) => (
                <InvoicePrintTemplate
                  key={invoice.id}
                  invoice={invoice}
                  company={settings.company}
                  soRef={orderFor(invoice)?.code || String(invoice.soRef || "–")}
                  lines={productLines(invoice)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

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
import { exportInvoicePdf } from "../components/exportInvoicePdf";
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
  const customers = useErpStore((state) => state.customers);
  const loadResources = useErpStore((state) => state.loadResources);
  const [customer, setCustomer] = useState("");
  const [targetInvoiceId, setTargetInvoiceId] = useState<string>("");
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCustomer(params.get("name") || "");
    setTargetInvoiceId(params.get("invoiceId") || "");
    setSelectedLot(params.get("lot") || "");
    loadResources(["customers"]);
  }, [loadResources]);

  const allCustomerInvoices = useMemo(
    () =>
      invoices
        .filter(
          (invoice) => invoice.customer === customer && balance(invoice) > 0,
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [invoices, customer],
  );

  // Available lots across this customer's invoices
  const availableLots = useMemo(() => {
    const lots = new Set<string>();
    allCustomerInvoices.forEach((inv) => {
      inv.lines?.forEach((line) => {
        if (line.lot && line.lot !== "UNSPECIFIED") {
          lots.add(line.lot);
        }
      });
    });
    return Array.from(lots);
  }, [allCustomerInvoices]);

  const customerInvoices = useMemo(() => {
    let list = allCustomerInvoices;
    if (targetInvoiceId) {
      const matched = list.filter(
        (inv) => String(inv.id) === String(targetInvoiceId),
      );
      if (matched.length > 0) list = matched;
    }
    if (selectedLot && selectedLot !== "ALL") {
      list = list.filter((inv) => {
        if (!inv.lines?.length) return true;
        return inv.lines.some(
          (line) => (line.lot || "UNSPECIFIED") === selectedLot,
        );
      });
    }
    return list;
  }, [allCustomerInvoices, targetInvoiceId, selectedLot]);

  const totals = useMemo(
    () => ({
      original: customerInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      credited: customerInvoices.reduce(
        (sum, inv) => sum + (inv.credited ?? 0),
        0,
      ),
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

  const customerRecord = useMemo(
    () => customers.find((c) => c.name === customer),
    [customers, customer],
  );

  const productLines = (invoice: Invoice): DisplayLine[] => {
    let lines = invoice.lines;
    if (lines?.length) {
      if (selectedLot && selectedLot !== "ALL") {
        const filtered = lines.filter(
          (line) => (line.lot || "UNSPECIFIED") === selectedLot,
        );
        if (filtered.length > 0) lines = filtered;
      }
      return lines.map((line, index) => ({
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
      await exportInvoicePdf(element, `${invoice.code || invoice.id}.pdf`);
      setToast("Export ใบแจ้งหนี้สำเร็จ");
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">
                    ข้อมูลลูกค้า
                  </div>
                  <div className="mt-1 text-2xl font-bold">{customer}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {targetInvoiceId ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-[var(--erp-accent)]">
                        แสดงเฉพาะ Invoice:{" "}
                        <span className="font-mono">{targetInvoiceId}</span>
                      </span>
                    ) : (
                      <span>
                        Invoice ค้างชำระทั้งหมด {customerInvoices.length} ใบ
                      </span>
                    )}
                    {selectedLot && selectedLot !== "ALL" && (
                      <span className="ml-2 inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Lot: {selectedLot}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {availableLots.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">
                        กรองตาม Lot:
                      </span>
                      <select
                        value={selectedLot}
                        onChange={(e) => setSelectedLot(e.target.value)}
                        className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
                      >
                        <option value="">ทั้งหมด</option>
                        {availableLots.map((lot) => (
                          <option key={lot} value={lot}>
                            Lot: {lot}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(targetInvoiceId ||
                    (selectedLot && selectedLot !== "ALL")) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetInvoiceId("");
                        setSelectedLot("");
                      }}
                      className="h-8 rounded-md border border-dashed px-3 text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                    >
                      ดูข้อมูลทั้งหมดของลูกค้า
                    </button>
                  )}

                  <Link
                    href={`/customers`}
                    className="h-8 inline-flex items-center gap-1.5 rounded-md border px-3 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                  >
                    ⚙️ จัดการข้อมูลบริษัทลูกค้า
                  </Link>
                </div>
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
                  soRef={
                    orderFor(invoice)?.code || String(invoice.soRef || "–")
                  }
                  lines={productLines(invoice)}
                  customerData={customerRecord}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

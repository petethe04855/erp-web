"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useErpStore } from "@/lib/store/useErpStore";
import type { Invoice } from "@/lib/store/erpWorkflow";
import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecordPaymentDialog } from "../components/RecordPaymentDialog";

const balance = (invoice: Invoice) =>
  Math.max(0, invoice.amount - (invoice.credited ?? 0) - invoice.paid);
const money = (value: number) =>
  `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function CustomerInvoiceDetailPage() {
  const { tokens: t } = useTheme();
  const invoices = useErpStore((state) => state.invoices);
  const salesOrders = useErpStore((state) => state.salesOrders);
  const products = useErpStore((state) => state.products);
  const settings = useErpStore((state) => state.settings);
  const recordPayment = useErpStore((state) => state.recordPayment);
  const [customer, setCustomer] = useState("");
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setCustomer(new URLSearchParams(window.location.search).get("name") || "");
  }, []);
  // Customer detail from the outstanding-customer list must show only invoices
  // that still have an amount due. Fully paid invoices remain in the main
  // ledger, but must not appear as an outstanding item here.
  const customerInvoices = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.customer === customer && balance(invoice) > 0)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [invoices, customer],
  );
  const outstandingInvoices = customerInvoices.filter(
    (invoice) => balance(invoice) > 0,
  );
  const totals = {
    original: customerInvoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0,
    ),
    credited: customerInvoices.reduce(
      (sum, invoice) => sum + (invoice.credited ?? 0),
      0,
    ),
    paid: customerInvoices.reduce((sum, invoice) => sum + invoice.paid, 0),
    outstanding: customerInvoices.reduce(
      (sum, invoice) => sum + balance(invoice),
      0,
    ),
    overdue: customerInvoices
      .filter((invoice) => invoice.dueDate < today())
      .reduce((sum, invoice) => sum + balance(invoice), 0),
  };
  const orderFor = (invoice: Invoice) =>
    salesOrders.find(
      (order) =>
        (invoice.salesOrderId != null &&
          String(order.id) === String(invoice.salesOrderId)) ||
        String(order.id) === String(invoice.soRef) ||
        String(order.code) === String(invoice.soRef),
    );
  const productName = (sku: string) =>
    products.find((product) => product.sku === sku)?.name || sku;
  const productLines = (invoice: Invoice) => {
    const order = orderFor(invoice);
    return (
      order?.lines?.map((line) => ({
        sku: line.sku,
        name: productName(line.sku),
        qty: line.qty,
        unitPrice: line.unitPrice ?? 0,
        total: line.lineTotal ?? (line.unitPrice ?? 0) * line.qty,
      })) ?? []
    );
  };
  const previewInvoice = customerInvoices[0];
  const previewLines = previewInvoice ? productLines(previewInvoice) : [];
  const previewSubtotal = previewLines.reduce((sum, line) => sum + line.total, 0) || (previewInvoice?.amount ?? 0);
  const previewVatRate = settings.company.vatRate || 0;
  const previewVat = previewSubtotal * previewVatRate / 100;

  function showToast(value: string) {
    setToast(value);
    setTimeout(() => setToast(""), 3000);
  }
  function submitPayment(amount: number) {
    if (!paymentInvoice) return;
    const updated = recordPayment(paymentInvoice.id, amount);
    setPaymentInvoice(null);
    showToast(
      updated
        ? `บันทึกรับชำระ ${money(amount)} แล้ว`
        : "ไม่สามารถบันทึกรับชำระได้",
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: t.color.canvas }}>
      <TopBar
        t={t}
        title={customer || "รายละเอียดลูกค้า"}
        subtitle="ข้อมูลลูกค้า Invoice สินค้า และยอดชำระ"
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
                Invoice ทั้งหมด {customerInvoices.length} ใบ · ค้างชำระ{" "}
                {outstandingInvoices.length} ใบ
              </div>
            </Card>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["ยอด Invoice เดิม", totals.original],
                ["Credit Note", totals.credited],
                ["ชำระแล้ว", totals.paid],
                ["ยอดค้างชำระ", totals.outstanding],
                ["เกินกำหนด", totals.overdue],
              ].map(([label, value]) => (
                <Card key={String(label)} className="p-4">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div
                    className={`mt-1 text-xl font-bold ${label === "เกินกำหนด" && Number(value) > 0 ? "text-red-600" : ""}`}
                  >
                    {money(Number(value))}
                  </div>
                </Card>
              ))}
            </div>
            {previewInvoice && (
              <Card className="invoice-card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b p-6">
                  <div><div className="text-lg font-bold">{settings.company.name}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Invoice</div><div className="font-mono text-2xl font-semibold">{previewInvoice.code || previewInvoice.id}</div></div>
                  <div className="text-right"><Badge variant={balance(previewInvoice) === 0 ? "secondary" : previewInvoice.dueDate < today() ? "destructive" : "outline"}>{balance(previewInvoice) === 0 ? "ชำระครบ" : previewInvoice.dueDate < today() ? "เกินกำหนด" : "ค้างชำระ"}</Badge><div className="mt-2 text-xs text-muted-foreground">ออกเอกสาร {previewInvoice.issueDate}</div></div>
                </div>
                <div className="grid gap-5 border-b p-6 sm:grid-cols-3"><div><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bill to</div><div className="mt-1 font-semibold">{customer}</div><div className="text-xs text-muted-foreground">SO {orderFor(previewInvoice)?.code || previewInvoice.soRef}</div></div><div><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Due date</div><div className="mt-1 font-semibold">{previewInvoice.dueDate}</div><div className="text-xs text-muted-foreground">VAT {previewVatRate}%</div></div><div><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount due</div><div className="mt-1 text-xl font-bold">{money(balance(previewInvoice))}</div><div className="text-xs text-muted-foreground">ชำระแล้ว {money(previewInvoice.paid)}</div></div></div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>สินค้า</TableHead><TableHead className="text-right">จำนวน</TableHead><TableHead className="text-right">ราคาต่อหน่วย</TableHead><TableHead className="text-right">ยอดรวม</TableHead></TableRow></TableHeader><TableBody>{previewLines.map((line) => <TableRow key={line.sku}><TableCell className="font-mono text-xs">{line.sku}</TableCell><TableCell>{line.name}</TableCell><TableCell className="text-right">{line.qty}</TableCell><TableCell className="text-right">{money(line.unitPrice)}</TableCell><TableCell className="text-right font-semibold">{money(line.total)}</TableCell></TableRow>)}</TableBody></Table></div>
                <div className="flex justify-end p-6"><div className="w-72 space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(previewSubtotal)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">VAT ({previewVatRate}%)</span><span>{money(previewVat)}</span></div><div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total due</span><span>{money(previewInvoice.amount)}</span></div></div></div>
              </Card>
            )}
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                <div>
                  <div className="font-semibold">
                    รายละเอียด Invoice และสินค้า
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ข้อมูลทั้งหมดของลูกค้ารายนี้ พร้อมยอดคงเหลือและการรับชำระ
                  </div>
                </div>
                {totals.overdue > 0 && (
                  <Badge variant="destructive">มียอดเกินกำหนด</Badge>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice / SO</TableHead>
                      <TableHead>สินค้า</TableHead>
                      <TableHead>ออกเอกสาร</TableHead>
                      <TableHead>ครบกำหนด</TableHead>
                      <TableHead className="text-right">ยอดเดิม</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">ชำระแล้ว</TableHead>
                      <TableHead className="text-right">คงเหลือ</TableHead>
                      <TableHead>จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerInvoices.map((invoice) => {
                      const order = orderFor(invoice);
                      const lines = productLines(invoice);
                      const overdue =
                        invoice.dueDate < today() && balance(invoice) > 0;
                      return (
                        <TableRow
                          key={invoice.id}
                          className={
                            overdue ? "bg-red-50/30 dark:bg-red-950/10" : ""
                          }
                        >
                          <TableCell>
                            <div className="font-mono font-semibold">
                              {invoice.code || invoice.id}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              SO {order?.code || invoice.soRef}
                            </div>
                            <Badge
                              variant={
                                balance(invoice) === 0
                                  ? "secondary"
                                  : overdue
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {balance(invoice) === 0
                                ? "ชำระครบ"
                                : overdue
                                  ? "เกินกำหนด"
                                  : "ค้างชำระ"}
                            </Badge>
                          </TableCell>
                          <TableCell className="min-w-72">
                            {lines.length ? (
                              lines.map((line) => (
                                <div
                                  key={`${invoice.id}-${line.sku}`}
                                  className="border-b py-1.5 last:border-0"
                                >
                                  <div className="font-medium">{line.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-mono">
                                      {line.sku}
                                    </span>{" "}
                                    · {line.qty} ชิ้น × {money(line.unitPrice)}{" "}
                                    · รวม {money(line.total)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                ไม่มีรายละเอียดสินค้าใน Sales Order เดิม
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{invoice.issueDate}</TableCell>
                          <TableCell
                            className={
                              overdue ? "font-semibold text-red-600" : ""
                            }
                          >
                            {invoice.dueDate}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(invoice.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(invoice.credited ?? 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(invoice.paid)}
                          </TableCell>
                          <TableCell className="text-right text-base font-bold">
                            {money(balance(invoice))}
                          </TableCell>
                          <TableCell>
                            {balance(invoice) > 0 && (
                              <Button
                                size="sm"
                                onClick={() => setPaymentInvoice(invoice)}
                              >
                                รับชำระ
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {customerInvoices.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="py-10 text-center text-muted-foreground"
                        >
                          ไม่พบข้อมูล Invoice ของลูกค้ารายนี้
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </main>
      <RecordPaymentDialog
        open={!!paymentInvoice}
        onOpenChange={(open) => {
          if (!open) setPaymentInvoice(null);
        }}
        invoiceId={paymentInvoice?.id ?? ""}
        outstanding={paymentInvoice ? balance(paymentInvoice) : 0}
        onSubmit={submitPayment}
        showToast={showToast}
      />
    </div>
  );
}

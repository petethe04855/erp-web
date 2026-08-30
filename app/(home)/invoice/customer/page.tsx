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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const balance = (invoice: Invoice) => Math.max(0, invoice.amount - (invoice.credited ?? 0) - invoice.paid);
const money = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const templateId = (invoiceId: number | string, lot: string) => `invoice-form-${invoiceId}-${lot.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

type DisplayLine = { key: number | string; sku: string; lot: string; name: string; qty: number; unitPrice: number; total: number };

export default function CustomerInvoiceDetailPage() {
  const { tokens: t } = useTheme();
  const invoices = useErpStore((state) => state.invoices);
  const salesOrders = useErpStore((state) => state.salesOrders);
  const products = useErpStore((state) => state.products);
  const settings = useErpStore((state) => state.settings);
  const [customer, setCustomer] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => setCustomer(new URLSearchParams(window.location.search).get("name") || ""), []);

  const customerInvoices = useMemo(() => invoices
    .filter((invoice) => invoice.customer === customer && balance(invoice) > 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [invoices, customer]);
  const totals = useMemo(() => ({
    original: customerInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    credited: customerInvoices.reduce((sum, invoice) => sum + (invoice.credited ?? 0), 0),
    paid: customerInvoices.reduce((sum, invoice) => sum + invoice.paid, 0),
    outstanding: customerInvoices.reduce((sum, invoice) => sum + balance(invoice), 0),
    overdue: customerInvoices.filter((invoice) => invoice.dueDate < today()).reduce((sum, invoice) => sum + balance(invoice), 0),
  }), [customerInvoices]);

  const orderFor = (invoice: Invoice) => salesOrders.find((order) =>
    (invoice.salesOrderId != null && String(order.id) === String(invoice.salesOrderId)) ||
    String(order.id) === String(invoice.soRef) || String(order.code) === String(invoice.soRef));
  const productLines = (invoice: Invoice): DisplayLine[] => {
    if (invoice.lines?.length) return invoice.lines.map((line, index) => ({ key: line.id ?? `${line.sku}-${index}`, sku: line.sku, lot: line.lot || "UNSPECIFIED", name: line.name, qty: line.qty, unitPrice: line.unitPrice, total: line.lineTotal }));
    const order = orderFor(invoice);
    return order?.lines?.map((line, index) => ({ key: line.id ?? `${line.sku}-${index}`, sku: line.sku, lot: "UNSPECIFIED", name: products.find((product) => product.sku === line.sku)?.name || line.sku, qty: line.qty, unitPrice: line.unitPrice ?? 0, total: line.lineTotal ?? (line.unitPrice ?? 0) * line.qty })) ?? [];
  };

  async function exportForm(invoice: Invoice, lot: string) {
    const element = document.getElementById(templateId(invoice.id, lot));
    if (!element) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set({ margin: 10, filename: `${invoice.code || invoice.id}-${lot}.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, backgroundColor: "#ffffff" }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(element).save();
      setToast("Export ใบแจ้งหนี้สำเร็จ");
    } catch { setToast("Export ใบแจ้งหนี้ไม่สำเร็จ"); }
  }

  return <div style={{ minHeight: "100vh", background: t.color.canvas }}>
    <TopBar t={t} title={customer || "รายละเอียดลูกค้า"} subtitle="รายการใบแจ้งหนี้ค้างชำระ" breadcrumb={["Chawy", "Invoices", "รายละเอียดลูกค้า", customer || "–"]} right={<div className="flex items-center gap-3">{toast && <span className="text-sm text-emerald-600">{toast}</span>}<Link href="/invoice" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted">← กลับหน้า Invoice</Link></div>} />
    <main className="space-y-5 p-4 md:p-8">
      {!customer ? <Card className="p-6 text-center text-muted-foreground">ไม่พบชื่อลูกค้าใน URL</Card> : <>
        <Card className="border-l-4 border-l-[var(--erp-accent)] p-5"><div className="text-xs text-muted-foreground">ข้อมูลลูกค้า</div><div className="mt-1 text-2xl font-bold">{customer}</div><div className="mt-2 text-sm text-muted-foreground">Invoice ค้างชำระ {customerInvoices.length} ใบ · Export จะแยกเอกสารตาม lot</div></Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["ยอด Invoice เดิม", totals.original], ["Credit Note", totals.credited], ["ชำระแล้ว", totals.paid], ["ยอดค้างชำระ", totals.outstanding], ["เกินกำหนด", totals.overdue]].map(([label, value]) => <Card key={String(label)} className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-xl font-bold ${label === "เกินกำหนด" && Number(value) > 0 ? "text-red-600" : ""}`}>{money(Number(value))}</div></Card>)}</div>
        <Card className="overflow-hidden"><div className="border-b p-4"><div className="font-semibold">รายการ Invoice ค้างชำระ</div><div className="text-xs text-muted-foreground">ไม่มีปุ่มรับชำระในหน้านี้; เลือก Export เพื่อสร้างฟอร์มตามภาพ</div></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Invoice / SO</TableHead><TableHead>สินค้า</TableHead><TableHead>ออกเอกสาร</TableHead><TableHead>ครบกำหนด</TableHead><TableHead className="text-right">ยอดค้างชำระ</TableHead><TableHead>Export</TableHead></TableRow></TableHeader><TableBody>{customerInvoices.map((invoice) => { const lines = productLines(invoice); const lots = Array.from(new Set(lines.map((line) => line.lot))); const overdue = invoice.dueDate < today(); return <TableRow key={invoice.id} className={overdue ? "bg-red-50/30 dark:bg-red-950/10" : ""}><TableCell><div className="font-mono font-semibold">{invoice.code || invoice.id}</div><div className="font-mono text-xs text-muted-foreground">SO {orderFor(invoice)?.code || invoice.soRef}</div><Badge variant={overdue ? "destructive" : "outline"}>{overdue ? "เกินกำหนด" : "ค้างชำระ"}</Badge></TableCell><TableCell className="min-w-72">{lines.map((line) => <div key={line.key} className="border-b py-1.5 last:border-0"><div className="font-medium">{line.name}</div><div className="text-xs text-muted-foreground"><span className="font-mono">{line.sku}</span> · Lot {line.lot} · {line.qty} ชิ้น · {money(line.total)}</div></div>)}</TableCell><TableCell>{invoice.issueDate}</TableCell><TableCell className={overdue ? "font-semibold text-red-600" : ""}>{invoice.dueDate}</TableCell><TableCell className="text-right text-base font-bold">{money(balance(invoice))}</TableCell><TableCell><div className="flex flex-wrap gap-2">{lots.map((lot) => <Button key={lot} size="sm" variant="outline" onClick={() => exportForm(invoice, lot)}>Export {lot === "UNSPECIFIED" ? "Invoice" : `Lot ${lot}`}</Button>)}</div></TableCell></TableRow>})}{customerInvoices.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">ไม่พบ Invoice ค้างชำระของลูกค้ารายนี้</TableCell></TableRow>}</TableBody></Table></div></Card>
        <div className="fixed left-[-10000px] top-0">{customerInvoices.flatMap((invoice) => { const lines = productLines(invoice); return Array.from(new Set(lines.map((line) => line.lot))).map((lot) => { const lotLines = lines.filter((line) => line.lot === lot); const subtotal = lotLines.reduce((sum, line) => sum + line.total, 0); const vat = invoice.vatAmount && lotLines.length === lines.length ? invoice.vatAmount : 0; const total = subtotal + vat; return <section key={`${invoice.id}-${lot}`} id={templateId(invoice.id, lot)} className="w-[718px] min-h-[1047px] bg-white p-10 text-black"><header className="flex justify-between border-b border-slate-400 pb-8"><div><div className="text-xl font-bold">{settings.company.name}</div><div className="mt-1 text-xs">{settings.company.address}</div><div className="text-xs">Phone: {settings.company.phone}</div></div><div className="w-60 text-right"><div className="text-3xl font-bold tracking-wide text-[#5a89cc]">INVOICE</div><div className="mt-4 grid grid-cols-2 border border-slate-500 text-center text-xs"><b className="border-r border-slate-500 bg-slate-200 p-1">INVOICE #</b><b className="bg-slate-200 p-1">DATE</b><span className="border-r border-slate-500 p-1">{invoice.code || invoice.id}</span><span className="p-1">{invoice.issueDate}</span></div></div></header><div className="grid grid-cols-2 gap-6 border-b border-slate-400 py-8 text-sm"><div><div className="bg-slate-200 px-3 py-1 text-[10px] font-bold">BILL TO</div><div className="mt-1 font-semibold">{invoice.customer}</div><div className="whitespace-pre-line">{invoice.customerAddress || "–"}</div><div>Tax ID: {invoice.customerTaxId || "–"}</div></div><div><div>SO: {invoice.soRef || "–"}</div><div className="font-semibold">LOT: {lot === "UNSPECIFIED" ? "–" : lot}</div><div>Due date: {invoice.dueDate}</div></div></div><div className="min-h-[390px]"><div className="grid grid-cols-[1fr_150px] bg-slate-200 px-3 py-2 text-[10px] font-bold"><span>DESCRIPTION</span><span className="text-right">AMOUNT</span></div>{lotLines.map((line) => <div key={line.key} className="grid grid-cols-[1fr_150px] px-3 py-2 text-sm"><div>{line.name}<div className="text-xs text-slate-500">{line.sku} · {line.qty} × {money(line.unitPrice)}</div></div><div className="text-right">{money(line.total)}</div></div>)}</div><footer className="border border-slate-500 p-4"><div className="flex justify-between"><i>Thank you for your business!</i><div className="w-56 space-y-1"><div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span>VAT</span><span>{money(vat)}</span></div><div className="flex justify-between border-t pt-2 text-lg font-bold"><span>TOTAL</span><span>{money(total)}</span></div></div></div></footer><div className="pt-10 text-center text-xs">หากมีข้อสงสัย กรุณาติดต่อ {settings.company.phone} · {settings.company.email}</div></section>; }); })}</div>
      </>}
    </main>
  </div>;
}

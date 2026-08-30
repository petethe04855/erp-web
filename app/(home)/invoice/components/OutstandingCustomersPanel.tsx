"use client";

import { useMemo, useState } from "react";
import type { Invoice, Product, SalesOrder } from "@/lib/store/erpWorkflow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CustomerDebt = { customer: string; invoices: Invoice[]; outstanding: number; overdue: number; nearestDue: string };
const balance = (invoice: Invoice) => Math.max(0, invoice.amount - (invoice.credited ?? 0) - invoice.paid);
const money = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function OutstandingCustomersPanel({ invoices, salesOrders, products, onSelectInvoice }: { invoices: Invoice[]; salesOrders: SalesOrder[]; products: Product[]; onSelectInvoice: (id: number | string) => void }) {
  const [selected, setSelected] = useState<CustomerDebt | null>(null);
  const customers = useMemo(() => {
    const grouped = new Map<string, Invoice[]>();
    invoices.filter((invoice) => balance(invoice) > 0).forEach((invoice) => grouped.set(invoice.customer, [...(grouped.get(invoice.customer) || []), invoice]));
    return [...grouped.entries()].map(([customer, rows]) => ({
      customer, invoices: rows,
      outstanding: rows.reduce((sum, invoice) => sum + balance(invoice), 0),
      overdue: rows.filter((invoice) => invoice.dueDate < new Date().toISOString().slice(0, 10)).reduce((sum, invoice) => sum + balance(invoice), 0),
      nearestDue: [...rows].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate || "",
    })).sort((a, b) => b.outstanding - a.outstanding);
  }, [invoices]);
  if (!customers.length) return <Card className="no-print mx-6 mt-6 border-emerald-200 p-4 md:mx-8"><div className="font-semibold text-emerald-700">ไม่มีลูกค้าที่ค้างชำระ</div><div className="text-sm text-muted-foreground">Invoice ทุกใบชำระครบหรือถูก Credit Note ครบแล้ว</div></Card>;
  const total = customers.reduce((sum, customer) => sum + customer.outstanding, 0);
  const orderFor = (invoice: Invoice) => salesOrders.find((order) =>
    (invoice.salesOrderId != null && String(order.id) === String(invoice.salesOrderId)) ||
    String(order.id) === String(invoice.soRef) || String(order.code) === String(invoice.soRef),
  );
  const productName = (sku: string) => products.find((product) => product.sku === sku)?.name || sku;
  const selectedItemQty = selected?.invoices.reduce((sum, invoice) => sum + (orderFor(invoice)?.lines.reduce((lineSum, line) => lineSum + line.qty, 0) ?? 0), 0) ?? 0;
  return <>
    <Card className="no-print mx-6 mt-6 overflow-hidden md:mx-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><div className="font-semibold">ลูกค้าที่ค้างชำระ</div><div className="text-xs text-muted-foreground">{customers.length} ราย · ค้างรวม {money(total)}</div></div><Badge variant="secondary">เรียงตามยอดค้างสูงสุด</Badge></div>
      <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ลูกค้า</TableHead><TableHead className="text-right">Invoice ค้าง</TableHead><TableHead className="text-right">ยอดค้างชำระ</TableHead><TableHead className="text-right">เกินกำหนด</TableHead><TableHead>ครบกำหนดใกล้สุด</TableHead><TableHead>จัดการ</TableHead></TableRow></TableHeader><TableBody>{customers.map((customer) => <TableRow key={customer.customer} className={customer.overdue > 0 ? "bg-red-50/30 dark:bg-red-950/10" : ""}>
        <TableCell><div className="font-semibold">{customer.customer}</div><div className="text-xs text-muted-foreground">รวมข้อมูลจาก Invoice ของชื่อนี้ทั้งหมด</div></TableCell><TableCell className="text-right">{customer.invoices.length} ใบ</TableCell><TableCell className="text-right text-base font-bold">{money(customer.outstanding)}</TableCell><TableCell className="text-right">{customer.overdue > 0 ? <span className="font-semibold text-red-600">{money(customer.overdue)}</span> : "–"}</TableCell><TableCell>{customer.nearestDue}</TableCell><TableCell><Button size="sm" variant="outline" onClick={() => { window.location.href = `/invoice/customer?name=${encodeURIComponent(customer.customer)}`; }}>ดูรายละเอียด</Button></TableCell>
      </TableRow>)}</TableBody></Table></div>
      <div className="hidden">{customers.map((customer) => <div key={customer.customer} className={`rounded-lg border p-4 ${customer.overdue > 0 ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" : ""}`}>
        <div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{customer.customer}</div><div className="text-xs text-muted-foreground">ค้าง {customer.invoices.length} ใบ · ครบกำหนดใกล้สุด {customer.nearestDue}</div></div>{customer.overdue > 0 && <Badge variant="destructive">เกินกำหนด</Badge>}</div>
        <div className="mt-4 flex items-end justify-between"><div><div className="text-xs text-muted-foreground">ยอดที่ต้องชำระ</div><div className="text-xl font-bold">{money(customer.outstanding)}</div>{customer.overdue > 0 && <div className="text-xs text-red-600">เกินกำหนด {money(customer.overdue)}</div>}</div><Button size="sm" variant="outline" onClick={() => { window.location.href = `/invoice/customer?name=${encodeURIComponent(customer.customer)}`; }}>ดูรายละเอียด</Button></div>
      </div>)}</div>
    </Card>

    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-w-5xl"><DialogHeader><DialogTitle>รายละเอียดลูกค้าที่ต้องชำระ · {selected?.customer}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-md bg-muted p-3"><div className="text-xs text-muted-foreground">ยอดค้างรวม</div><div className="text-lg font-bold">{money(selected?.outstanding ?? 0)}</div></div><div className="rounded-md bg-muted p-3"><div className="text-xs text-muted-foreground">Invoice ค้าง</div><div className="text-lg font-bold">{selected?.invoices.length ?? 0} ใบ</div></div><div className="rounded-md bg-muted p-3"><div className="text-xs text-muted-foreground">สินค้ารวม</div><div className="text-lg font-bold">{selectedItemQty} ชิ้น</div></div><div className="rounded-md bg-muted p-3"><div className="text-xs text-muted-foreground">ยอดเกินกำหนด</div><div className="text-lg font-bold text-red-600">{money(selected?.overdue ?? 0)}</div></div></div>
      <div className="max-h-[460px] overflow-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>สินค้า</TableHead><TableHead>ครบกำหนด</TableHead><TableHead className="text-right">ยอดเดิม</TableHead><TableHead className="text-right">Credit</TableHead><TableHead className="text-right">ชำระแล้ว</TableHead><TableHead className="text-right">คงเหลือ</TableHead><TableHead /></TableRow></TableHeader><TableBody>{selected?.invoices.map((invoice) => { const order = orderFor(invoice); return <TableRow key={invoice.id}><TableCell><div className="font-mono font-semibold">{invoice.code || invoice.id}</div><div className="font-mono text-xs text-muted-foreground">SO {order?.code || invoice.soRef}</div><Badge variant={invoice.dueDate < new Date().toISOString().slice(0, 10) ? "destructive" : "outline"}>{invoice.dueDate < new Date().toISOString().slice(0, 10) ? "เกินกำหนด" : invoice.status}</Badge></TableCell><TableCell className="min-w-56">{order?.lines?.length ? order.lines.map((line, index) => <div key={`${line.sku}-${index}`} className="border-b py-1 last:border-0"><div className="font-medium">{productName(line.sku)}</div><div className="text-xs text-muted-foreground"><span className="font-mono">{line.sku}</span> · {line.qty} ชิ้น × {money(line.unitPrice ?? 0)}{line.lineTotal != null ? ` = ${money(line.lineTotal)}` : ""}</div></div>) : <span className="text-xs text-muted-foreground">ไม่มีรายละเอียดสินค้าใน Sales Order เดิม</span>}</TableCell><TableCell>{invoice.dueDate}</TableCell><TableCell className="text-right">{money(invoice.amount)}</TableCell><TableCell className="text-right">{money(invoice.credited ?? 0)}</TableCell><TableCell className="text-right">{money(invoice.paid)}</TableCell><TableCell className="text-right font-bold">{money(balance(invoice))}</TableCell><TableCell><Button size="sm" variant="outline" onClick={() => { onSelectInvoice(invoice.id); setSelected(null); }}>เปิด Invoice</Button></TableCell></TableRow>; })}</TableBody></Table></div>
    </DialogContent></Dialog>
  </>;
}

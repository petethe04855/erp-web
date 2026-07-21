"use client";

import React, { useMemo, useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Dot, Mono, TopBar, fmtNum } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useErpStore } from "@/lib/store/useErpStore";
import type { Invoice } from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";
import { CreateInvoiceSheet } from "./components/CreateInvoiceSheet";
import { RecordPaymentDialog } from "./components/RecordPaymentDialog";

function fmtBaht(n: number, dec = 0): string {
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
  return `${sign}${v}`;
}

const today = new Date().toISOString().split("T")[0];
const due14 = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

function formatDate(date: string) {
  const d = new Date(date);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  if (Number.isNaN(d.getTime())) return date;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function daysBetween(from: string, to: string) {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 14;
  return Math.max(0, Math.round((b - a) / 86400000));
}

function enrichStatus(inv: Invoice): Invoice {
  if (inv.status === "Unpaid" && inv.dueDate < today) {
    return { ...inv, status: "Overdue" };
  }
  return inv;
}

const PDF_SAFE_CSS_VARS: Record<string, string> = {
  "--background": "#ffffff",
  "--foreground": "#171717",
  "--card": "#ffffff",
  "--card-foreground": "#171717",
  "--popover": "#ffffff",
  "--popover-foreground": "#171717",
  "--primary": "#171717",
  "--primary-foreground": "#ffffff",
  "--secondary": "#f4f2ec",
  "--secondary-foreground": "#171717",
  "--muted": "#f4f2ec",
  "--muted-foreground": "#8a8881",
  "--accent": "#f4f2ec",
  "--accent-foreground": "#171717",
  "--destructive": "#b91c1c",
  "--border": "#e8e4da",
  "--input": "#e8e4da",
  "--ring": "#8a8881",
};

function isUnsupportedPdfColor(value: string) {
  return /(?:^|\s)(?:lab|lch|oklab|oklch|color-mix|color)\(/i.test(value);
}

function safePdfColor(value: string, fallback: string) {
  return value && !isUnsupportedPdfColor(value) ? value : fallback;
}

function preparePdfElement(source: HTMLElement) {
  const clone = source.cloneNode(true) as HTMLElement;
  const sourceNodes = [
    source,
    ...Array.from(source.querySelectorAll<HTMLElement>("*")),
  ];
  const cloneNodes = [
    clone,
    ...Array.from(clone.querySelectorAll<HTMLElement>("*")),
  ];
  const colorProps = [
    "color",
    "backgroundColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "textDecorationColor",
    "caretColor",
  ] as const;

  Object.entries(PDF_SAFE_CSS_VARS).forEach(([name, value]) =>
    clone.style.setProperty(name, value),
  );
  clone.querySelectorAll<HTMLElement>(".print-company-detail").forEach((el) => {
    el.style.setProperty("display", "block", "important");
  });

  cloneNodes.forEach((node, i) => {
    const sourceNode = sourceNodes[i];
    if (!sourceNode) return;
    const computed = window.getComputedStyle(sourceNode);
    colorProps.forEach((prop) => {
      const fallback =
        prop === "backgroundColor" ? "rgba(255, 255, 255, 0)" : "#171717";
      node.style[prop] = safePdfColor(computed[prop], fallback);
    });
    node.style.boxShadow = "none";
  });

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${source.offsetWidth}px`;
  wrapper.style.background = "#ffffff";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return { element: clone, cleanup: () => document.body.removeChild(wrapper) };
}

export default function InvoicePage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const invoices = useErpStore((state) => state.invoices);
  const salesOrders = useErpStore((state) => state.salesOrders);
  const products = useErpStore((state) => state.products);
  const createInvoice = useErpStore((state) => state.createInvoice);
  const recordPayment = useErpStore((state) => state.recordPayment);
  const settings = useErpStore((state) => state.settings);

  const processedList = useMemo(() => invoices.map(enrichStatus), [invoices]);
  const [selectedId, setSelectedId] = useState(
    processedList.find((i) => i.status !== "Paid")?.id ??
      processedList[0]?.id ??
      "",
  );
  const selected =
    processedList.find((i) => i.id === selectedId) ?? processedList[0];

  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [toast, setToast] = useState("");

  const salesOrder = selected
    ? salesOrders.find((so) => so.id === selected.soRef)
    : null;
  const eligibleSOs = salesOrders.filter(
    (so) =>
      so.status === "Completed" && !invoices.some((inv) => inv.soRef === so.id),
  );

  const vatRate = settings.company.vatRate || 7;

  const lines = useMemo(() => {
    if (!selected) return [];
    if (salesOrder?.lines.length) {
      const subtotalQty =
        salesOrder.lines.reduce((s, line) => s + line.qty, 0) || 1;
      return salesOrder.lines.map((line) => {
        const product = products.find((p) => p.sku === line.sku);
        const amount = Math.round(selected.amount * (line.qty / subtotalQty));
        const price = line.qty > 0 ? Math.round(amount / line.qty) : amount;
        return {
          sku: line.sku,
          name: product?.name ?? line.sku,
          qty: line.qty,
          price: product?.wholesalePrice ?? product?.price ?? price,
          amount,
        };
      });
    }
    return [
      {
        sku: selected.soRef || selected.id,
        name: `Invoice amount — ${selected.customer}`,
        qty: 1,
        price: selected.amount,
        amount: selected.amount,
      },
    ];
  }, [products, salesOrder, selected]);

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const vat = Math.round((subtotal * vatRate) / 100);
  const totalDue = subtotal + vat;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleCreate(data: {
    soRef?: string;
    customer: string;
    issueDate: string;
    dueDate: string;
    amount: number;
  }) {
    if (data.soRef && invoices.some((inv) => inv.soRef === data.soRef)) {
      showToast("มี Invoice จาก SO นี้แล้ว");
      return;
    }
    const inv = createInvoice(data);
    setSelectedId(inv.id);
    setCreateOpen(false);
    showToast(`สร้าง ${inv.id} แล้ว`);
  }

  function handlePayment(amount: number) {
    const updated = recordPayment(selected.id, amount);
    setPayOpen(false);
    if (updated) {
      setSelectedId(updated.id);
      showToast(
        `${updated.id} → ${updated.status === "Paid" ? "ชำระครบ" : "ชำระบางส่วน"}`,
      );
    }
  }

  async function handleExport() {
    try {
      await exportXlsx(
        "invoices",
        `invoices-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      showToast("Export สำเร็จ");
    } catch (err: any) {
      showToast("Export ล้มเหลว: " + err.message);
    }
  }

  async function handleDownloadPdf() {
    if (!selected) return;
    try {
      showToast("กำลังเตรียมไฟล์ PDF...");
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.querySelector(".invoice-card") as HTMLElement;
      if (!element) {
        showToast("ไม่พบข้อมูล Invoice Card");
        return;
      }
      const pdf = preparePdfElement(element);

      const opt = {
        margin: 10,
        filename: `${selected.id}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      try {
        await html2pdf().set(opt).from(pdf.element).save();
      } finally {
        pdf.cleanup();
      }
      showToast("โหลดไฟล์สำเร็จ");
    } catch (err: any) {
      console.error(err);
      showToast("ดาวน์โหลด PDF ล้มเหลว");
    }
  }

  if (!selected) {
    return (
      <div className="min-h-screen bg-canvas" style={{ background: c.canvas }}>
        <TopBar
          t={t}
          title="Invoice"
          subtitle="ใบแจ้งหนี้"
          right={
            <Button
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + สร้างใบแจ้งหนี้
            </Button>
          }
        />
        <div className="p-6 md:p-8 max-w-[1320px] mx-auto">
          <Card
            t={t}
            className="p-12 text-center border border-border bg-card"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div className="text-5xl mb-4">📄</div>
            <h3
              className="text-base font-semibold text-foreground"
              style={{ color: "var(--erp-ink)" }}
            >
              ยังไม่มีใบแจ้งหนี้ (No Invoices)
            </h3>
            <p
              className="text-xs text-muted-foreground mt-2 mb-5"
              style={{ color: "var(--erp-ink3)" }}
            >
              คุณสามารถสร้างใบแจ้งหนี้ใหม่ได้โดยคลิกปุ่มด้านล่าง
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + สร้างใบแจ้งหนี้แรก
            </Button>
          </Card>
        </div>

        <CreateInvoiceSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          eligibleSOs={eligibleSOs}
          onSubmit={handleCreate}
          showToast={showToast}
        />
      </div>
    );
  }

  const outstanding = selected.amount - selected.paid;
  const terms = daysBetween(selected.issueDate, selected.dueDate);
  const customerInvoices = processedList.filter(
    (inv) => inv.customer === selected.customer,
  );
  const customerRevenue = customerInvoices.reduce(
    (s, inv) => s + inv.amount,
    0,
  );
  const openInvoices = customerInvoices.filter(
    (inv) => inv.status !== "Paid",
  ).length;

  const actionRight = (
    <div className="no-print flex items-center gap-2">
      {toast && (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 pr-2">
          {toast}
        </span>
      )}
      <Button
        variant="outline"
        onClick={handleExport}
        className="cursor-pointer"
      >
        Export CSV
      </Button>
      <Button
        variant="outline"
        onClick={() => window.print()}
        className="cursor-pointer"
      >
        Print
      </Button>
      <Button
        variant="outline"
        onClick={handleDownloadPdf}
        className="cursor-pointer"
      >
        Export PDF
      </Button>
      <Button
        onClick={() => setPayOpen(true)}
        className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
      >
        Record payment
      </Button>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <div className="no-print">
        <TopBar
          t={t}
          breadcrumb={["Chawy", "Sales", "Invoices", selected.id]}
          title={selected.id || "Invoice"}
          subtitle={
            <span>
              Reference{" "}
              <Mono t={t} size={13} color={c.accent}>
                {selected.soRef}
              </Mono>
              {" · "}
              {selected.customer}
            </span>
          }
          right={actionRight}
        />
      </div>

      <div className="p-6 md:p-8 max-w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="grid gap-6">
          <div className="invoice-card">
            <Card
              t={t}
              pad={false}
              className="border border-border bg-card"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              <div className="p-8 pb-0 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div
                    className="text-base font-bold text-foreground mb-1"
                    style={{ color: "var(--erp-ink)" }}
                  >
                    {settings.company.name}
                  </div>
                  <div className="print-company-detail hidden">
                    <div
                      className="text-xs text-muted-foreground leading-relaxed mb-1"
                      style={{ color: "var(--erp-ink2)" }}
                    >
                      {settings.company.address}
                    </div>
                    <div
                      className="flex gap-4 text-[11px] text-muted-foreground"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      <span>
                        Tax ID{" "}
                        <Mono t={t} size={11} color={c.ink2}>
                          {settings.company.taxId}
                        </Mono>
                      </span>
                      <span>·</span>
                      <span>{settings.company.phone}</span>
                      <span>·</span>
                      <span>{settings.company.email}</span>
                    </div>
                  </div>
                  <div
                    className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground mt-2"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Invoice
                  </div>
                  <span className="block mt-1">
                    <Mono t={t} size={24} weight={600}>
                      {selected.id}
                    </Mono>
                  </span>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      selected.status === "Paid"
                        ? "normal"
                        : selected.status === "Overdue"
                          ? "empty"
                          : "low"
                    }
                  >
                    {selected.status}
                  </Badge>
                  <span className="block mt-2">
                    <Mono t={t} size={11} color={c.ink3}>
                      Issued {formatDate(selected.issueDate)}
                    </Mono>
                  </span>
                </div>
              </div>

              <div
                className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-border mt-4"
                style={{ borderColor: "var(--erp-border)" }}
              >
                <div>
                  <div
                    className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground mb-2"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Bill to
                  </div>
                  <div
                    className="text-sm font-semibold text-foreground"
                    style={{ color: "var(--erp-ink)" }}
                  >
                    {selected.customer}
                  </div>
                  <div
                    className="text-xs text-muted-foreground mt-1 leading-relaxed"
                    style={{ color: "var(--erp-ink2)" }}
                  >
                    Customer record from ERP invoice ledger
                  </div>
                  <div
                    className="flex gap-3 mt-2 text-[11px] text-muted-foreground"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    <span>
                      SO{" "}
                      <Mono t={t} size={11} color={c.ink2}>
                        {selected.soRef}
                      </Mono>
                    </span>
                    <span>·</span>
                    <span>{salesOrder?.channel ?? "Manual"} channel</span>
                  </div>
                </div>
                <div>
                  <div
                    className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground mb-2"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Due date
                  </div>
                  <Mono t={t} size={14} weight={500}>
                    {formatDate(selected.dueDate)}
                  </Mono>
                  <div
                    className="text-xs text-muted-foreground mt-1"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Net {terms} · {terms} days from issue
                  </div>
                </div>
                <div>
                  <div
                    className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground mb-2"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Amount due
                  </div>
                  <Mono t={t} size={20} weight={600}>
                    {fmtBaht(outstanding)}
                  </Mono>
                  <div
                    className="text-xs text-muted-foreground mt-1"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {selected.paid > 0
                      ? `${fmtBaht(selected.paid)} paid`
                      : "awaiting payment"}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table className="w-full border-collapse">
                  <TableHeader
                    className="bg-muted/50 border-b border-border"
                    style={{
                      background: "var(--erp-subtle)",
                      borderColor: "var(--erp-border)",
                    }}
                  >
                    <TableRow>
                      <TableHead
                        className="p-3 px-8 text-xs font-bold text-muted-foreground uppercase text-left"
                        style={{ color: "var(--erp-ink3)", width: 130 }}
                      >
                        SKU
                      </TableHead>
                      <TableHead
                        className="p-3 px-8 text-xs font-bold text-muted-foreground uppercase text-left"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        Description
                      </TableHead>
                      <TableHead
                        className="p-3 px-8 text-xs font-bold text-muted-foreground uppercase text-right"
                        style={{ color: "var(--erp-ink3)", width: 80 }}
                      >
                        Qty
                      </TableHead>
                      <TableHead
                        className="p-3 px-8 text-xs font-bold text-muted-foreground uppercase text-right"
                        style={{ color: "var(--erp-ink3)", width: 120 }}
                      >
                        Unit price (THB)
                      </TableHead>
                      <TableHead
                        className="p-3 px-8 text-xs font-bold text-muted-foreground uppercase text-right"
                        style={{ color: "var(--erp-ink3)", width: 130 }}
                      >
                        Amount (THB)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow
                        key={line.sku}
                        className="border-b border-border"
                        style={{ borderColor: "var(--erp-border)" }}
                      >
                        <TableCell className="p-4 px-8 align-middle">
                          <Mono t={t} size={12} weight={500}>
                            {line.sku}
                          </Mono>
                        </TableCell>
                        <TableCell
                          className="p-4 px-8 align-middle text-sm font-medium text-foreground"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {line.name}
                        </TableCell>
                        <TableCell className="p-4 px-8 align-middle text-right">
                          <Mono t={t} size={12} color={c.ink2}>
                            {fmtNum(line.qty)}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-8 align-middle text-right">
                          <Mono t={t} size={12} color={c.ink2}>
                            {fmtNum(line.price)}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-8 align-middle text-right">
                          <Mono t={t} size={13} weight={500}>
                            {fmtNum(line.amount)}
                          </Mono>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-8 pt-5 flex justify-end">
                <div className="w-80 flex flex-col gap-2.5">
                  {[
                    {
                      label: "Subtotal",
                      val: subtotal,
                      color: c.ink2,
                      weight: 500,
                    },
                    {
                      label: `VAT (${vatRate}%)`,
                      val: vat,
                      color: c.ink2,
                      weight: 500,
                    },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span
                        className="text-muted-foreground"
                        style={{ color: c.ink3 }}
                      >
                        {r.label}
                      </span>
                      <Mono t={t} size={13} weight={r.weight} color={r.color}>
                        {fmtBaht(r.val)}
                      </Mono>
                    </div>
                  ))}
                  <div
                    className="border-t border-border pt-3 flex justify-between items-baseline"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <span
                      className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
                      style={{ color: c.ink3 }}
                    >
                      Total due
                    </span>
                    <Mono t={t} size={22} weight={600}>
                      {fmtBaht(totalDue)}
                    </Mono>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="no-print grid gap-3 mt-2">
            <div
              className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
              style={{ color: "var(--erp-ink3)" }}
            >
              Activity
            </div>
            <Card
              t={t}
              className="border border-border bg-card p-5"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              {(selected.auditTrail.length
                ? selected.auditTrail
                : [
                    {
                      action: "Created",
                      by: "System",
                      at: selected.issueDate,
                      note: "สร้างใบแจ้งหนี้",
                    },
                  ]
              ).map((event, i, arr) => (
                <div
                  key={`${event.action}-${event.at}-${i}`}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-3"
                  style={{
                    borderBottom:
                      i < arr.length - 1
                        ? `1px solid var(--erp-border)`
                        : "none",
                  }}
                >
                  <Dot color={i === 0 ? c.accent : c.ink4} />
                  <div>
                    <div className="text-sm text-foreground">
                      <span className="font-semibold">{event.by}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        {event.action}
                      </span>
                    </div>
                    {event.note && (
                      <div
                        className="text-xs text-muted-foreground mt-1"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        {event.note}
                      </div>
                    )}
                  </div>
                  <Mono t={t} size={11} color={c.ink3}>
                    {event.at}
                  </Mono>
                </div>
              ))}
            </Card>
          </div>

          <div className="no-print grid gap-3 mt-2">
            <div className="flex justify-between items-center">
              <span
                className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                Invoice ledger
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="cursor-pointer h-7"
              >
                Create invoice
              </Button>
            </div>
            <Card
              t={t}
              pad={false}
              className="overflow-hidden border border-border bg-card"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              {processedList.slice(0, 6).map((inv) => {
                const active = inv.id === selected.id;
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => setSelectedId(inv.id)}
                    className="w-full grid grid-cols-[140px_1fr_120px_110px] gap-4 items-center p-3 px-5 border-b border-border last:border-b-0 cursor-pointer text-left font-sans"
                    style={{
                      borderColor: "var(--erp-border)",
                      background: active ? c.accentBg : "transparent",
                    }}
                  >
                    <Mono
                      t={t}
                      size={12}
                      weight={600}
                      color={active ? c.accent : c.ink}
                    >
                      {inv.id}
                    </Mono>
                    <span
                      className="text-sm text-muted-foreground"
                      style={{ color: "var(--erp-ink2)" }}
                    >
                      {inv.customer}
                    </span>
                    <Mono t={t} size={12} weight={500}>
                      {fmtBaht(inv.amount - inv.paid)}
                    </Mono>
                    <div>
                      <Badge
                        variant={
                          inv.status === "Paid"
                            ? "normal"
                            : inv.status === "Overdue"
                              ? "empty"
                              : "low"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </Card>
          </div>
        </div>

        <div className="no-print flex flex-col gap-6 sticky top-28">
          <Card
            t={t}
            className="border border-border bg-card p-5"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div
              className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground mb-4"
              style={{ color: "var(--erp-ink3)" }}
            >
              Payment
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <span className="block">
                  <Mono t={t} size={26} weight={600}>
                    {fmtBaht(outstanding)}
                  </Mono>
                </span>
                <div
                  className="text-xs text-muted-foreground mt-1"
                  style={{ color: c.ink3 }}
                >
                  Due in {terms} days · {formatDate(selected.dueDate)}
                </div>
              </div>
              <div
                className="h-[1px] bg-border"
                style={{ background: c.border }}
              />
              {[
                { label: "Outstanding", val: outstanding },
                { label: "Paid", val: selected.paid },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-xs">
                  <span
                    className="text-muted-foreground"
                    style={{ color: c.ink3 }}
                  >
                    {row.label}
                  </span>
                  <Mono t={t} size={12} weight={500}>
                    {fmtBaht(row.val)}
                  </Mono>
                </div>
              ))}
              <Button
                onClick={() => setPayOpen(true)}
                className="w-full bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer mt-1"
              >
                Record payment
              </Button>
            </div>
          </Card>

          <Card
            t={t}
            className="border border-border bg-card p-5"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div
              className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground mb-4"
              style={{ color: "var(--erp-ink3)" }}
            >
              Customer summary
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Lifetime revenue", value: fmtBaht(customerRevenue) },
                { label: "Open invoices", value: String(openInvoices) },
                { label: "Avg. payment terms", value: `${terms}.0 days` },
                {
                  label: "Credit limit",
                  value: fmtBaht(Math.max(500000, customerRevenue)),
                },
                {
                  label: "Credit used",
                  value: fmtBaht(
                    customerInvoices.reduce(
                      (s, inv) => s + Math.max(0, inv.amount - inv.paid),
                      0,
                    ),
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-baseline text-xs"
                >
                  <span
                    className="text-muted-foreground"
                    style={{ color: c.ink3 }}
                  >
                    {row.label}
                  </span>
                  <Mono t={t} size={12} weight={500}>
                    {row.value}
                  </Mono>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <CreateInvoiceSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        eligibleSOs={eligibleSOs}
        onSubmit={handleCreate}
        showToast={showToast}
      />

      <RecordPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        invoiceId={selected.id}
        outstanding={outstanding}
        onSubmit={handlePayment}
        showToast={showToast}
      />
    </div>
  );
}

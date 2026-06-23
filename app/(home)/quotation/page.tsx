"use client";
import { useState } from "react";
import {
  formatBaht,
  type LeadSource,
  type QuotationStatus,
} from "@/lib/mockData";
import SlidePanel from "@/components/SlidePanel";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import {
  Card,
  Mono,
  TopBar,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";


type Line = { sku: string; qty: number };
const LEAD_SOURCES: LeadSource[] = [
  "Live",
  "LINE",
  "Facebook",
  "Shopee",
  "Walk-in",
  "B2B Referral",
];
const BLANK_FORM = {
  customer: "",
  leadSource: "Live" as LeadSource,
  validUntil: addDaysIso(15),
  lines: [{ sku: "", qty: 1 }] as Line[],
};

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function quoteStatus(status: QuotationStatus) {
  if (status === "Approved" || status === "Converted") return "completed";
  if (status === "Rejected" || status === "Expired") return "cancelled";
  if (status === "Sent") return "sent";
  return "draft";
}

export default function QuotationPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const list = useErpStore((state) => state.quotations);
  const products = useErpStore((state) => state.products);
  const createQuotation = useErpStore((state) => state.createQuotation);
  const convertQuotationToSalesOrder = useErpStore(
    (state) => state.convertQuotationToSalesOrder,
  );
  const updateQuotationStatus = useErpStore(
    (state) => state.updateQuotationStatus,
  );

  const getProductName = (sku: string) =>
    products.find((p) => p.sku === sku)?.name ?? sku;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [toast, setToast] = useState("");

  const total = list.reduce((s, q) => s + q.amount, 0);
  const lineTotal = form.lines.reduce((s, line) => {
    const product = products.find((p) => p.sku === line.sku);
    return s + (product ? product.price * line.qty : 0);
  }, 0);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }
  function addLine() {
    setForm((f) => ({ ...f, lines: [...f.lines, { sku: "", qty: 1 }] }));
  }
  function removeLine(i: number) {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  }
  function updateLine(i: number, field: keyof Line, val: string | number) {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((line, idx) =>
        idx === i ? { ...line, [field]: val } : line,
      ),
    }));
  }

  function handleSubmit() {
    const validLines = form.lines.filter((l) => l.sku && l.qty > 0);
    if (!form.customer || !form.validUntil || validLines.length === 0) {
      showToast("กรุณากรอกลูกค้า วันหมดอายุ และสินค้า");
      return;
    }
    const newQt = createQuotation({
      customer: form.customer,
      validUntil: form.validUntil,
      leadSource: form.leadSource,
      lines: validLines,
    });
    setForm(BLANK_FORM);
    setOpen(false);
    showToast(`สร้าง ${newQt.id} แล้ว`);
  }

  function transition(id: string, status: QuotationStatus, note: string) {
    const updated = updateQuotationStatus(id, status, note);
    if (updated) showToast(`${id} → ${status}`);
  }

  function convertToSO(id: string) {
    const salesOrder = convertQuotationToSalesOrder(id);
    if (salesOrder) showToast(`${id} → ${salesOrder.id} แล้ว`);
  }

  return (
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Sales", "Quotations"]}
        title="Quotations"
        subtitle={`ใบเสนอราคา · ${list.length} รายการ · ${formatBaht(total)} pipeline`}
        right={
          <>
            {toast && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: toast.includes("กรุณา") ? c.neg : c.pos,
                }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => {
                setForm({ ...BLANK_FORM, validUntil: addDaysIso(15) });
                setOpen(true);
              }}
            >
              + New Quotation
            </Button>
          </>
        }
      />

      <div style={{ padding: "24px 32px 48px" }}>
        <Card t={t} pad={false} style={{ overflow: "auto" }}>
          <Table className="min-w-[920px]">
            <TableHeader>
              <TableRow>
                {["Quote", "Customer", "Issued", "Valid until"].map((h) => (
                  <TableHead key={h} className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</TableHead>
                ))}
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="py-3.5 px-6">
                    <Mono t={t} size={12} weight={500}>
                      {q.id}
                    </Mono>
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {q.status === "Draft" && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            transition(q.id, "Sent", "ส่งให้ลูกค้าแล้ว รออนุมัติ")
                          }
                          className="h-6 px-2 text-[10px]"
                        >
                          Send
                        </Button>
                      )}
                      {q.status === "Sent" && (
                        <Button
                          onClick={() =>
                            transition(
                              q.id,
                              "Approved",
                              "Admin/Owner อนุมัติใบเสนอราคา",
                            )
                          }
                          className="h-6 px-2 text-[10px] bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
                        >
                          Approve
                        </Button>
                      )}
                      {q.status === "Approved" && !q.soRef && (
                        <Button
                          onClick={() => convertToSO(q.id)}
                          className="h-6 px-2 text-[10px] bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
                        >
                          Create SO
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <span
                      style={{ fontSize: 13, fontWeight: 500, color: c.ink }}
                    >
                      {q.customer}
                    </span>
                    <div style={{ fontSize: 11, color: c.ink3, marginTop: 2 }}>
                      {q.leadSource} · {q.items} items
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <Mono t={t} size={12} color={c.ink2}>
                      {q.date}
                    </Mono>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <Mono t={t} size={12} color={c.ink2}>
                      {q.validUntil}
                    </Mono>
                  </TableCell>
                  <TableCell className="text-right py-3.5 px-6">
                    <Mono t={t} size={13} weight={600}>
                      {formatBaht(q.amount)}
                    </Mono>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    {quoteStatus(q.status) === "completed" && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                        Approved
                      </Badge>
                    )}
                    {quoteStatus(q.status) === "cancelled" && (
                      <Badge variant="destructive">
                        Cancelled
                      </Badge>
                    )}
                    {quoteStatus(q.status) === "sent" && (
                      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                        Sent
                      </Badge>
                    )}
                    {quoteStatus(q.status) === "draft" && (
                      <Badge variant="outline">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-[520px] flex flex-col h-full p-0 bg-background">
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">New Quotation</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">สร้างใบเสนอราคาใหม่ - ยอดรวม {formatBaht(lineTotal)}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</label>
              <Input
                value={form.customer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer: e.target.value }))
                }
                placeholder="ชื่อลูกค้า"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead source</label>
                <select
                  value={form.leadSource}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      leadSource: e.target.value as LeadSource,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valid until</label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, validUntil: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Items</span>
              <Button variant="outline" onClick={addLine}>
                + Add item
              </Button>
            </div>
            <div className="border border-border rounded-md overflow-hidden bg-background">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {form.lines.map((line, i) => {
                    const product = products.find((p) => p.sku === line.sku);
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            i === form.lines.length - 1
                              ? "none"
                              : `1px solid ${c.border}`,
                        }}
                      >
                        <td style={{ padding: 10 }}>
                          <select
                            value={line.sku}
                            onChange={(e) => updateLine(i, "sku", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.sku} value={p.sku}>
                                {p.name} · stock {p.stock}
                              </option>
                            ))}
                          </select>
                          {line.sku && (
                            <div
                              style={{
                                fontSize: 11,
                                color: c.ink3,
                                marginTop: 4,
                              }}
                            >
                              {getProductName(line.sku)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: 10, width: 86 }}>
                          <Input
                            type="number"
                            min={1}
                            value={line.qty}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateLine(
                                i,
                                "qty",
                                val === "" ? "" : Math.max(1, parseInt(val) || 0),
                              );
                            }}
                            className="text-center w-20"
                          />
                        </td>
                        <td
                          style={{ padding: 10, width: 110, textAlign: "right" }}
                        >
                          <Mono t={t} size={12}>
                            {product ? formatBaht(product.price * line.qty) : "—"}
                          </Mono>
                        </td>
                        <td style={{ padding: 10, width: 42 }}>
                          {form.lines.length > 1 && (
                            <Button
                              variant="ghost"
                              onClick={() => removeLine(i)}
                              className="p-2 h-8 w-8 text-lg"
                            >
                              ×
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <SheetFooter className="border-t border-border p-6 flex-shrink-0">
            <div className="flex w-full items-center justify-between">
              <Mono t={t} size={14} weight={600}>
                {formatBaht(lineTotal)}
              </Mono>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
                >
                  Save Draft
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import type { PurchaseOrderStatus } from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, StatStrip, TopBar } from "@/components/ui";
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

type ItemLine = { sku: string; name: string; qty: number; unitCost: number };
const BLANK_LINE: ItemLine = { sku: "", name: "", qty: 1, unitCost: 0 };
const BLANK = { supplier: "", etaDate: "", items: [{ ...BLANK_LINE }] };
const statusMap: Record<PurchaseOrderStatus, string> = {
  Draft: "draft",
  Sent: "sent",
  "Partial Received": "pending",
  Completed: "completed",
};

function getBadge(status: PurchaseOrderStatus) {
  const code = statusMap[status];
  if (code === "completed") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
        Completed
      </Badge>
    );
  }
  if (code === "sent") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
        Sent
      </Badge>
    );
  }
  if (code === "pending") {
    return (
      <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20">
        Partial Received
      </Badge>
    );
  }
  return <Badge variant="outline">Draft</Badge>;
}

export default function PurchaseOrderPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const list = useErpStore((s) => s.purchaseOrders);
  const products = useErpStore((s) => s.products);
  const createPO = useErpStore((s) => s.createPurchaseOrder);
  const updatePOStatus = useErpStore((s) => s.updatePOStatus);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [toast, setToast] = useState("");

  const rows = useMemo(
    () =>
      list.map((po) => ({
        ...po,
        openValue: po.status === "Completed" ? 0 : po.totalCost,
      })),
    [list],
  );
  const total = rows.reduce((s, p) => s + p.totalCost, 0);
  const openValue = rows.reduce((s, p) => s + p.openValue, 0);
  const lineTotal = form.items.reduce(
    (s, line) => s + line.qty * line.unitCost,
    0,
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }
  function addLine() {
    setForm((f) => ({ ...f, items: [...f.items, { ...BLANK_LINE }] }));
  }
  function removeLine(i: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }
  function updateLine(i: number, field: keyof ItemLine, val: string | number) {
    setForm((f) => ({
      ...f,
      items: f.items.map((line, idx) => {
        if (idx !== i) return line;
        if (field === "sku") {
          const prod = products.find((p) => p.sku === val);
          return {
            ...line,
            sku: val as string,
            name: prod?.name ?? "",
            unitCost: prod?.cost ?? 0,
          };
        }
        return { ...line, [field]: val };
      }),
    }));
  }

  function handleSubmit() {
    const validItems = form.items.filter((i) => (i.sku || i.name) && i.qty > 0);
    if (!form.supplier || !form.etaDate || validItems.length === 0) {
      showToast("กรุณากรอกซัพพลายเออร์ วัน ETA และรายการ");
      return;
    }
    const po = createPO({
      supplier: form.supplier,
      etaDate: form.etaDate,
      items: validItems,
    });
    setForm(BLANK);
    setOpen(false);
    showToast(`สร้าง ${po.id} แล้ว`);
  }

  function handleStatusChange(poId: string, status: PurchaseOrderStatus) {
    const updated = updatePOStatus(poId, status);
    if (updated) showToast(`${poId} → ${status}`);
  }

  async function handleExport() {
    try {
      await exportXlsx(
        "purchase-orders",
        `purchase-orders-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      showToast("Export สำเร็จ");
    } catch (err: any) {
      showToast("Export ล้มเหลว: " + err.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Purchasing", "Purchase Orders"]}
        title="Purchase Orders"
        subtitle={`ใบสั่งซื้อ · ${rows.length} รายการ · ${formatBaht(openValue)} ค้างรับ`}
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
            <Button variant="outline" onClick={handleExport}>
              Export
            </Button>
            <Button
              onClick={() => {
                setForm(BLANK);
                setOpen(true);
              }}
            >
              + New PO
            </Button>
          </>
        }
      />

      <div style={{ padding: "24px 32px 48px" }}>
        <StatStrip
          t={t}
          tiles={[
            {
              label: "Total ordered",
              value: formatBaht(total),
              sub: "this month",
            },
            {
              label: "Open value",
              value: formatBaht(openValue),
              sub: "awaiting receipt",
            },
            { label: "Overdue POs", value: "0", sub: "past ETA", tone: c.neg },
            {
              label: "Suppliers",
              value: String(new Set(rows.map((p) => p.supplier)).size),
              sub: "active",
            },
          ]}
        />

        <Card t={t} pad={false} style={{ overflow: "auto" }}>
          <Table className="min-w-[940px]">
            <TableHeader>
              <TableRow>
                {["PO", "Supplier", "Order date", "ETA"].map((h) => (
                  <TableHead
                    key={h}
                    className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Items
                </TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((po) => {
                return (
                  <TableRow key={po.id}>
                    <TableCell className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <Mono t={t} size={12} weight={500}>
                          {po.id}
                        </Mono>
                        {po.status === "Draft" && (
                          <Button
                            variant="outline"
                            onClick={() => handleStatusChange(po.id, "Sent")}
                            className="h-6 px-2 text-[10px]"
                          >
                            Send
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span
                        style={{ fontSize: 13, fontWeight: 500, color: c.ink }}
                      >
                        {po.supplier}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>
                        {po.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>
                        {po.etaDate}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        {po.items.length}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={13} weight={600}>
                        {formatBaht(po.totalCost)}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {getBadge(po.status)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-[620px] flex flex-col h-full p-0 bg-background"
        >
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">
              New Purchase Order
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              สร้างใบสั่งซื้อใหม่ - ยอดรวม {formatBaht(lineTotal)}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Supplier
              </label>
              <Input
                value={form.supplier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supplier: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ETA
              </label>
              <Input
                type="date"
                value={form.etaDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, etaDate: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Items
              </span>
              <Button variant="outline" onClick={addLine}>
                + Add item
              </Button>
            </div>
            <div
              style={{
                border: `1px solid ${c.border}`,
                borderRadius: t.radius,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {form.items.map((line, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom:
                          i === form.items.length - 1
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
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: 10, width: 84 }}>
                        <Input
                          type="number"
                          min={1}
                          value={line.qty}
                          onChange={(e) =>
                            updateLine(
                              i,
                              "qty",
                              Math.max(1, parseInt(e.target.value) || 1),
                            )
                          }
                          className="text-center"
                        />
                      </td>
                      <td style={{ padding: 10, width: 116 }}>
                        <Input
                          type="number"
                          min={0}
                          value={line.unitCost}
                          onChange={(e) =>
                            updateLine(
                              i,
                              "unitCost",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="text-right"
                        />
                      </td>
                      <td style={{ padding: 10, width: 42 }}>
                        {form.items.length > 1 && (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <SheetFooter className="border-t border-border p-6 flex-shrink-0">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
              >
                Save PO
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

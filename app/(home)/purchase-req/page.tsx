"use client";
import { useMemo, useState } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import type { PurchaseRequestStatus } from "@/lib/store/erpWorkflow";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

type ItemLine = { sku: string; name: string; qty: number; note: string };
const BLANK_LINE: ItemLine = { sku: "", name: "", qty: 1, note: "" };
const BLANK = {
  requester: "",
  reason: "",
  neededDate: "",
  items: [{ ...BLANK_LINE }],
};

const statusMap: Record<PurchaseRequestStatus, string> = {
  Draft: "draft",
  "Pending Approval": "pending",
  Approved: "completed",
  Rejected: "cancelled",
};

function getBadge(status: PurchaseRequestStatus) {
  const code = statusMap[status];
  if (code === "completed") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
        Approved
      </Badge>
    );
  }
  if (code === "pending") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
        Pending
      </Badge>
    );
  }
  if (code === "cancelled") {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="outline">Draft</Badge>;
}

export default function PurchaseReqPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const list = useErpStore((s) => s.purchaseRequests);
  const products = useErpStore((s) => s.products);
  const createPR = useErpStore((s) => s.createPurchaseRequest);
  const updatePRStatus = useErpStore((s) => s.updatePRStatus);
  const convertPRtoPO = useErpStore((s) => s.convertPRtoPO);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [toast, setToast] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertPrId, setConvertPrId] = useState("");
  const [convertSupplier, setConvertSupplier] = useState("");
  const [convertEta, setConvertEta] = useState("");
  const [convertCosts, setConvertCosts] = useState<Record<string, number>>({});

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const rows = useMemo(
    () =>
      list.map((pr) => {
        const est = pr.items.reduce((sum, item) => {
          const product = products.find((p) => p.sku === item.sku);
          return sum + item.qty * (product?.cost ?? 0);
        }, 0);
        return {
          ...pr,
          est,
          itemSummary: pr.items
            .map((i) => `${i.name || i.sku} x${i.qty}`)
            .join(", "),
        };
      }),
    [list, products],
  );
  const pending = rows.filter((p) => p.status === "Pending Approval");
  const totalEst = rows.reduce((s, p) => s + p.est, 0);

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
          return { ...line, sku: val as string, name: prod?.name ?? "" };
        }
        return { ...line, [field]: val };
      }),
    }));
  }

  function handleSubmit() {
    const validItems = form.items.filter((i) => (i.sku || i.name) && i.qty > 0);
    if (!form.requester || !form.neededDate || validItems.length === 0) {
      showToast("กรุณากรอกผู้ขอ วันที่ต้องการ และรายการอย่างน้อย 1 รายการ");
      return;
    }
    const pr = createPR({
      requester: form.requester,
      reason: form.reason,
      neededDate: form.neededDate,
      items: validItems,
    });
    setForm(BLANK);
    setOpen(false);
    showToast(`สร้าง ${pr.id} แล้ว`);
  }

  function handleStatusChange(prId: string, status: PurchaseRequestStatus) {
    const updated = updatePRStatus(prId, status);
    if (updated) showToast(`${prId} → ${status}`);
  }

  function openConvertToPO(prId: string) {
    const pr = list.find((p) => p.id === prId);
    if (!pr) return;
    setConvertPrId(prId);
    setConvertSupplier("");
    setConvertEta("");
    const costs: Record<string, number> = {};
    pr.items.forEach((i) => {
      const prod = products.find((p) => p.sku === i.sku);
      costs[i.sku] = prod?.cost ?? 0;
    });
    setConvertCosts(costs);
    setConvertOpen(true);
  }

  function handleConvert() {
    if (!convertSupplier || !convertEta) {
      showToast("กรุณากรอกซัพพลายเออร์และ ETA");
      return;
    }
    const po = convertPRtoPO(
      convertPrId,
      convertSupplier,
      convertEta,
      convertCosts,
    );
    setConvertOpen(false);
    if (po) showToast(`${convertPrId} → ${po.id} แล้ว`);
  }

  const convertPr = list.find((p) => p.id === convertPrId);

  return (
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Purchasing", "Purchase Req."]}
        title="Purchase Requisitions"
        subtitle={`ใบขอซื้อ · ${pending.length} รออนุมัติ · ${formatBaht(totalEst)} มูลค่าประมาณ`}
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
                setForm(BLANK);
                setOpen(true);
              }}
            >
              + New Request
            </Button>
          </>
        }
      />

      <div style={{ padding: "24px 32px 48px" }}>
        <StatStrip
          t={t}
          tiles={[
            {
              label: "Pending approval",
              value: String(pending.length),
              sub: "awaiting review",
              tone: pending.length ? c.warn : c.ink,
            },
            {
              label: "Est. value",
              value: formatBaht(pending.reduce((s, p) => s + p.est, 0)),
              sub: "pending requests",
            },
            {
              label: "Approved · MTD",
              value: String(rows.filter((p) => p.status === "Approved").length),
              sub: "this month",
            },
            { label: "Avg. lead time", value: "4.2 วัน", sub: "request → PO" },
          ]}
        />

        <Card t={t} pad={false} style={{ overflow: "auto" }}>
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                {["PR", "Requester", "Date", "Item", "Quantity"].map((h) => (
                  <TableHead
                    key={h}
                    className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Est. value
                </TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((pr) => {
                return (
                  <TableRow key={pr.id}>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} weight={500}>
                        {pr.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 13, color: c.ink2 }}>
                        {pr.requester}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>
                        {pr.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span
                        style={{ fontSize: 13, fontWeight: 500, color: c.ink }}
                      >
                        {pr.items[0]?.name || pr.items[0]?.sku || "—"}
                      </span>
                      {pr.items.length > 1 && (
                        <span
                          style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}
                        >
                          +{pr.items.length - 1}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>
                        {pr.items.reduce((s, item) => s + item.qty, 0)}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={13} weight={600}>
                        {formatBaht(pr.est)}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {pr.status === "Pending Approval" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Button
                            onClick={() =>
                              handleStatusChange(pr.id, "Approved")
                            }
                            className="h-6 px-2 text-[10px] bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(pr.id, "Rejected")
                            }
                            className="h-6 px-2 text-[10px]"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : pr.status === "Draft" ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(pr.id, "Pending Approval")
                          }
                          className="h-6 px-2 text-[10px]"
                        >
                          Submit
                        </Button>
                      ) : pr.status === "Approved" && !pr.poRef ? (
                        <Button
                          onClick={() => openConvertToPO(pr.id)}
                          className="h-6 px-2 text-[10px] bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
                        >
                          Create PO
                        </Button>
                      ) : (
                        getBadge(pr.status)
                      )}
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
          className="sm:max-w-[520px] flex flex-col h-full p-0 bg-background"
        >
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">
              New Purchase Request
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              สร้างใบขอซื้อใหม่
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requester
              </label>
              <Input
                value={form.requester}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requester: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reason
              </label>
              <Textarea
                value={form.reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Needed date
              </label>
              <Input
                type="date"
                value={form.neededDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, neededDate: e.target.value }))
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
                      <td style={{ padding: 10, width: 88 }}>
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
                Save Draft
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={convertOpen} onOpenChange={setConvertOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-[600px] flex flex-col h-full p-0 bg-background"
        >
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">
              Create PO from PR
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              {convertPrId}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Supplier
              </label>
              <Input
                value={convertSupplier}
                onChange={(e) => setConvertSupplier(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ETA
              </label>
              <Input
                type="date"
                value={convertEta}
                onChange={(e) => setConvertEta(e.target.value)}
              />
            </div>
            {convertPr && (
              <Card
                t={t}
                pad={false}
                style={{ overflow: "auto", marginTop: 16 }}
              >
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Item
                      </TableHead>
                      <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Qty
                      </TableHead>
                      <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Unit cost
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {convertPr.items.map((item, i) => {
                      return (
                        <TableRow key={`${item.sku}-${i}`}>
                          <TableCell className="py-3.5 px-6">
                            <span style={{ fontSize: 12, color: c.ink }}>
                              {item.name || item.sku}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 px-6">
                            <Mono t={t} size={12}>
                              {item.qty}
                            </Mono>
                          </TableCell>
                          <TableCell className="py-3.5 px-6 text-right">
                            <input
                              type="number"
                              min={0}
                              value={convertCosts[item.sku] ?? 0}
                              onChange={(e) =>
                                setConvertCosts((costs) => ({
                                  ...costs,
                                  [item.sku]: parseFloat(e.target.value) || 0,
                                }))
                              }
                              style={{
                                width: 100,
                                textAlign: "right",
                                border: `1px solid ${c.border}`,
                                borderRadius: 6,
                                padding: "6px 8px",
                                fontFamily: t.font.mono,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
          <SheetFooter className="border-t border-border p-6 flex-shrink-0">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setConvertOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConvert}
                className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
              >
                Create Purchase Order
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

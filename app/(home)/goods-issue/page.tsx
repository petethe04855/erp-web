"use client";
import { useMemo, useState } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import type { GoodsIssueReason } from "@/lib/store/erpWorkflow";
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

const REASONS: GoodsIssueReason[] = [
  "ตัวอย่าง",
  "เสียหาย/หมดอายุ",
  "ใช้ภายใน",
  "โปรโมชัน",
  "อื่นๆ",
];
const BLANK = {
  sku: "",
  qty: 1,
  reason: "ใช้ภายใน" as GoodsIssueReason,
  note: "",
};

function department(reason: GoodsIssueReason) {
  if (reason === "โปรโมชัน" || reason === "ตัวอย่าง") return "Marketing";
  if (reason === "เสียหาย/หมดอายุ") return "Warehouse";
  if (reason === "ใช้ภายใน") return "Operations";
  return "Inventory";
}

export default function GoodsIssuePage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const goodsIssues = useErpStore((s) => s.goodsIssues);
  const createGoodsIssue = useErpStore((s) => s.createGoodsIssue);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [toast, setToast] = useState("");

  const selectedProduct = products.find((p) => p.sku === form.sku);
  const available = selectedProduct
    ? selectedProduct.stock - selectedProduct.reservedQty
    : 0;
  const isOverStock = !!form.sku && form.qty > available;

  const rows = useMemo(
    () =>
      goodsIssues.map((issue) => {
        const product = products.find((p) => p.sku === issue.sku);
        return {
          ...issue,
          dept: department(issue.reason),
          value: issue.qty * (product?.cost ?? 0),
          status: "completed",
        };
      }),
    [goodsIssues, products],
  );
  const total = rows.reduce((s, g) => s + g.value, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleSubmit() {
    if (!form.sku || form.qty < 1) return;
    const result = createGoodsIssue({
      sku: form.sku,
      qty: form.qty,
      reason: form.reason,
      note: form.note,
    });
    if (!result) {
      showToast("สต๊อกไม่พอ กรุณาตรวจสอบ");
      return;
    }
    setForm(BLANK);
    setOpen(false);
    showToast(`สร้าง ${result.id} แล้ว · ตัด stock FEFO`);
  }

  return (
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Goods Issue"]}
        title="Goods Issue"
        subtitle={`เบิกสินค้าออก · ${rows.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={
          <>
            {toast && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: toast.includes("ไม่") ? c.neg : c.pos,
                }}
              >
                {toast}
              </span>
            )}
            <Button onClick={() => setOpen(true)}>+ Issue Goods</Button>
          </>
        }
      />

      <div style={{ padding: "24px 32px 48px" }}>
        <StatStrip
          t={t}
          tiles={[
            {
              label: "Issued · MTD",
              value: formatBaht(total),
              sub: `${rows.length} issues`,
            },
            {
              label: "To production",
              value: formatBaht(
                rows
                  .filter((g) => g.dept === "Operations")
                  .reduce((s, g) => s + g.value, 0),
              ),
              sub: "Operations",
            },
            {
              label: "Pending",
              value: "0",
              sub: "awaiting pick",
              tone: c.warn,
            },
            {
              label: "Departments",
              value: String(new Set(rows.map((g) => g.dept)).size),
              sub: "requesting",
            },
          ]}
        />

        <Card t={t} pad={false} style={{ overflow: "auto" }}>
          <Table className="min-w-[960px]">
            <TableHeader>
              <TableRow>
                {["GI", "Purpose", "Department", "Date"].map((h) => (
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
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Quantity
                </TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Value
                </TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((g) => {
                return (
                  <TableRow key={g.id}>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} weight={500}>
                        {g.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span
                        style={{ fontSize: 13, fontWeight: 500, color: c.ink }}
                      >
                        {g.reason}
                      </span>
                      <div
                        style={{ fontSize: 11, color: c.ink3, marginTop: 2 }}
                      >
                        {g.skuName}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 12, color: c.ink2 }}>
                        {g.dept}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>
                        {g.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        1
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>
                        {g.qty}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={13} weight={600}>
                        {formatBaht(g.value)}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No goods issue records
                  </TableCell>
                </TableRow>
              )}
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
              Issue Goods
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              บันทึกการนำสินค้าออกจากคลัง
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product
              </label>
              <select
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select product</option>
                {products.map((p) => {
                  const avail = p.stock - p.reservedQty;
                  return (
                    <option key={p.sku} value={p.sku}>
                      {p.name} · available {avail}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedProduct && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  border: `1px solid ${c.border}`,
                  borderRadius: t.radius,
                  overflow: "hidden",
                }}
              >
                {[
                  ["Stock", selectedProduct.stock],
                  ["Reserved", selectedProduct.reservedQty],
                  ["Available", available],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    style={{
                      padding: 12,
                      borderRight: i < 2 ? `1px solid ${c.border}` : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: c.ink3,
                        textTransform: "uppercase",
                        letterSpacing: "0.10em",
                      }}
                    >
                      {label}
                    </div>
                    <Mono t={t} size={18} weight={600}>
                      {value}
                    </Mono>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity
              </label>
              <Input
                type="number"
                min={1}
                max={available}
                value={form.qty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    qty: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className={isOverStock ? "border-destructive" : ""}
              />
              {isOverStock && (
                <div style={{ fontSize: 11, color: c.neg }}>
                  เกินสต๊อกพร้อมเบิก ({available} ชิ้น)
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Purpose
              </label>
              <select
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reason: e.target.value as GoodsIssueReason,
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Note
              </label>
              <Textarea
                value={form.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="รายละเอียดอื่นๆ"
              />
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
                disabled={!form.sku || isOverStock}
              >
                Save Issue
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

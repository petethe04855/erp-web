"use client";

import { useMemo, useState } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import type { GoodsIssueReason } from "@/lib/store/erpWorkflow";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, StatStrip, TopBar } from "@/components/ui";
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
import { GoodsIssueSheet } from "./components/GoodsIssueSheet";

const REASONS: GoodsIssueReason[] = [
  "ตัวอย่าง",
  "เสียหาย/หมดอายุ",
  "ใช้ภายใน",
  "โปรโมชัน",
  "อื่นๆ",
];

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
  const [toast, setToast] = useState("");

  const rows = useMemo(() => {
    return goodsIssues.map((issue) => {
      const product = products.find((p) => p.sku === issue.sku);
      return {
        ...issue,
        dept: department(issue.reason),
        value: issue.qty * (product?.cost ?? 0),
        status: "completed",
      };
    });
  }, [goodsIssues, products]);

  const total = rows.reduce((s, g) => s + g.value, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleCreateGoodsIssue(form: {
    sku: string;
    qty: number;
    reason: GoodsIssueReason;
    note: string;
  }) {
    const result = await createGoodsIssue({
      sku: form.sku,
      qty: form.qty,
      reason: form.reason,
      note: form.note,
    });
    if (!result) {
      showToast("สต๊อกไม่พอ กรุณาตรวจสอบ");
      return false;
    }
    showToast(`สร้าง ${result.id} แล้ว · ตัด stock FEFO`);
    return true;
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Goods Issue"]}
        title="Goods Issue"
        subtitle={`เบิกสินค้าออก · ${rows.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{
                  color:
                    toast.includes("ไม่") || toast.includes("เกิน")
                      ? c.neg
                      : c.pos,
                }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + Issue Goods
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
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

        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
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
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    GI
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Purpose
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Department
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Date
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Items
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Quantity
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Value
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((g) => (
                  <TableRow
                    key={g.id}
                    className="hover:bg-muted/50 transition-colors border-b border-border"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} weight={500}>
                        {g.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="text-sm font-medium text-foreground"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {g.reason}
                      </span>
                      <div
                        className="text-xs text-muted-foreground mt-0.5"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        {g.skuName}
                      </div>
                    </TableCell>
                    <TableCell
                      className="p-4 px-5 align-middle text-sm text-muted-foreground"
                      style={{ color: "var(--erp-ink2)" }}
                    >
                      {g.dept}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {g.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        1
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {g.qty}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={13} weight={600}>
                        {formatBaht(g.value)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Badge variant="normal">Completed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center p-10 text-sm text-muted-foreground"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      No goods issue records
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <GoodsIssueSheet
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleCreateGoodsIssue}
        products={products}
        showToast={showToast}
      />
    </div>
  );
}

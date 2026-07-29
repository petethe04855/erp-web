"use client";

import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AdjustmentHistorySheet } from "./components/AdjustmentHistorySheet";

export default function StockCheckPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const stockAdjustments = useErpStore((s) => s.stockAdjustments);
  const createStockAdjustment = useErpStore((s) => s.createStockAdjustment);

  const [counts, setCounts] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [counting, setCounting] = useState(false);
  const [toast, setToast] = useState("");
  const [histOpen, setHistOpen] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  function startCount() {
    const init: Record<string, string> = {};
    products.forEach((p) => {
      init[p.sku] = String(p.stock);
    });
    setCounts(init);
    setCounting(true);
    setNote("");
  }

  function cancelCount() {
    setCounts({});
    setCounting(false);
  }

  const variances = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    systemQty: p.stock,
    actual:
      counts[p.sku] !== undefined ? parseInt(counts[p.sku]) || 0 : p.stock,
    variance: (parseInt(counts[p.sku]) || 0) - p.stock,
  }));
  const totalVariance = variances.reduce((s, v) => s + v.variance, 0);

  function handleSubmit() {
    const belowReserved = products.find((p) => {
      const actualQty = parseInt(counts[p.sku]) || 0;
      return actualQty < p.reservedQty;
    });
    if (belowReserved) {
      showToast(`นับ ${belowReserved.name} ไม่ได้: ยอดจริงต้องไม่น้อยกว่าที่จองขาย ${belowReserved.reservedQty} ชิ้น`);
      return;
    }
    const items = products.map((p) => ({
      sku: p.sku,
      actualQty: parseInt(counts[p.sku]) || 0,
    }));
    createStockAdjustment({ note, items });
    setCounting(false);
    setCounts({});
    setNote("");
    showToast("บันทึกการตรวจนับเรียบร้อย สต๊อกอัปเดตแล้ว");
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Stock Checking"]}
        title="Stock Checking"
        subtitle="ตรวจนับสต๊อกและปรับยอด"
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{ color: c.pos }}
              >
                {toast}
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => setHistOpen(true)}
              className="cursor-pointer border-border"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              ประวัติ ({stockAdjustments.length})
            </Button>
            {!counting && (
              <Button
                onClick={startCount}
                className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
              >
                เริ่มนับสต๊อก
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "สินค้าทั้งหมด",
              value: products.length,
              sub: "รายการ",
              tone: c.ink,
            },
            {
              label: "รอบนับทั้งหมด",
              value: stockAdjustments.length,
              sub: "ครั้ง",
              tone: c.info,
            },
            {
              label: "มี Variance",
              value: counting
                ? variances.filter((v) => v.variance !== 0).length
                : "—",
              sub: "รายการ",
              tone: c.warn,
            },
            {
              label: "Variance รวม",
              value: counting
                ? totalVariance >= 0
                  ? `+${totalVariance}`
                  : totalVariance
                : "—",
              sub: "ชิ้น",
              tone:
                totalVariance > 0 ? c.pos : totalVariance < 0 ? c.neg : c.ink3,
            },
          ].map((item) => (
            <Card
              t={t}
              key={item.label}
              className="border border-border bg-card p-5"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                {item.label}
              </div>
              <span className="block mt-2">
                <Mono t={t} size={22} weight={600} color={item.tone}>
                  {item.value}
                </Mono>
              </span>
              <div
                className="text-xs text-muted-foreground mt-1"
                style={{ color: "var(--erp-ink3)" }}
              >
                {item.sub}
              </div>
            </Card>
          ))}
        </div>

        {!counting ? (
          <Card
            t={t}
            pad={false}
            className="overflow-hidden border border-border bg-card"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div
              className="p-4 px-5 border-b border-border text-sm font-bold text-foreground"
              style={{
                borderColor: "var(--erp-border)",
                color: "var(--erp-ink)",
              }}
            >
              สต๊อกปัจจุบัน (ระบบ)
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
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      สินค้า
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      SKU
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      สต๊อกระบบ
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      จอง
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      พร้อมขาย
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Reorder
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const avail = p.stock - p.reservedQty;
                    return (
                      <TableRow
                        key={p.sku}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                        style={{ borderColor: "var(--erp-border)" }}
                      >
                        <TableCell
                          className="p-4 px-5 align-middle text-sm font-semibold"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {p.name}
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle">
                          <Mono t={t} size={11} color={c.ink2}>
                            {p.sku}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-right">
                          <Mono t={t} size={13} weight={600}>
                            {p.stock}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-right">
                          <Mono
                            t={t}
                            size={12}
                            color={p.reservedQty > 0 ? c.warn : c.ink3}
                          >
                            {p.reservedQty}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-right">
                          <span
                            className="text-sm font-bold font-mono"
                            style={{
                              color: avail <= p.reorder ? c.neg : c.pos,
                            }}
                          >
                            {avail}
                          </span>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-right">
                          <span
                            className="text-sm font-mono"
                            style={{
                              color:
                                p.stock <= p.reorder
                                  ? c.neg
                                  : "var(--erp-ink3)",
                              fontWeight: p.stock <= p.reorder ? 700 : 400,
                            }}
                          >
                            {p.reorder}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div
              className="p-5 text-center text-xs border-t border-dashed"
              style={{
                borderColor: "var(--erp-border)",
                color: "var(--erp-ink3)",
              }}
            >
              กด <strong>&ldquo;เริ่มนับสต๊อก&rdquo;</strong>{" "}
              เพื่อเริ่มการตรวจนับและปรับปรุงยอด
            </div>
          </Card>
        ) : (
          <Card
            t={t}
            pad={false}
            className="overflow-hidden border border-border bg-card"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div
              className="p-4 px-5 border-b border-border flex items-center justify-between gap-4 flex-wrap"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-warnBg)",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: c.warn }}
                />
                <span className="text-sm font-bold" style={{ color: c.warn }}>
                  กำลังนับสต๊อก — กรอกยอดจริงที่นับได้
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={cancelCount}
                  className="h-8 text-xs px-3.5 cursor-pointer border-border"
                  style={{
                    borderColor: "var(--erp-border)",
                    background: "var(--erp-surface)",
                    color: "#374151",
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="h-8 text-xs px-3.5 cursor-pointer bg-[var(--erp-pos)] text-white hover:opacity-90 border-none shadow-none"
                  style={{ background: "var(--erp-pos)" }}
                >
                  บันทึกและปรับยอด
                </Button>
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
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      สินค้า
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-center w-32"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ยอดระบบ
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-center w-36"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ยอดนับจริง
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-center w-32"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Variance
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left w-32"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      สถานะ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variances.map((v) => {
                    const diff = v.variance;
                    const rowBg =
                      diff !== 0
                        ? diff > 0
                          ? "bg-emerald-50/40 dark:bg-emerald-950/10"
                          : "bg-red-50/40 dark:bg-red-950/10"
                        : "transparent";

                    return (
                      <TableRow
                        key={v.sku}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${rowBg}`}
                        style={{ borderColor: "var(--erp-border)" }}
                      >
                        <TableCell
                          className="p-4 px-5 align-middle text-sm font-semibold"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {v.name}
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-center">
                          <Mono t={t} size={12} weight={600}>
                            {v.systemQty}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-center">
                          <Input
                            type="number"
                            min={0}
                            value={counts[v.sku] ?? String(v.systemQty)}
                            onChange={(e) =>
                              setCounts((prev) => ({
                                ...prev,
                                [v.sku]: e.target.value,
                              }))
                            }
                            className="h-9 w-24 text-center font-mono font-bold text-sm mx-auto"
                            style={{
                              borderColor:
                                diff !== 0
                                  ? diff > 0
                                    ? c.pos
                                    : c.neg
                                  : "var(--erp-border)",
                            }}
                          />
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-center">
                          <span
                            className="text-sm font-bold font-mono"
                            style={{
                              color:
                                diff > 0
                                  ? c.pos
                                  : diff < 0
                                    ? c.neg
                                    : "var(--erp-ink3)",
                            }}
                          >
                            {diff > 0 ? `+${diff}` : diff === 0 ? "—" : diff}
                          </span>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle">
                          {diff === 0 ? (
                            <span
                              className="text-[11px] font-bold"
                              style={{ color: c.pos }}
                            >
                              ตรง
                            </span>
                          ) : (
                            <span
                              className="text-[11px] font-bold"
                              style={{ color: diff > 0 ? c.pos : c.neg }}
                            >
                              {diff > 0 ? "▲ เพิ่ม" : "▼ ขาด"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div
              className="p-5 border-t border-border flex flex-col gap-1.5"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-subtle)",
              }}
            >
              <Label
                className="text-xs font-bold text-foreground"
                style={{ color: "var(--erp-ink2)" }}
              >
                บันทึกรอบนับ (หมายเหตุ)
              </Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ตรวจนับรอบเดือน พ.ค. 2026"
              />
            </div>
          </Card>
        )}
      </div>

      <AdjustmentHistorySheet
        open={histOpen}
        onOpenChange={setHistOpen}
        adjustments={stockAdjustments}
      />
    </div>
  );
}

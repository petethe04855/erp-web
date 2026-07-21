"use client";

import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CreateTransferSheet } from "./components/CreateTransferSheet";

export default function StockTransferPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const stockTransfers = useErpStore((s) => s.stockTransfers);
  const createStockTransfer = useErpStore((s) => s.createStockTransfer);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleTransferSubmit(data: {
    sku: string;
    qty: number;
    fromLocation: string;
    toLocation: string;
    note: string;
  }) {
    const result = createStockTransfer(data);
    if (!result) {
      showToast("สต๊อกไม่พอ");
      return;
    }
    showToast(
      `โอน ${result.skuName} ${result.qty} ชิ้น: ${result.fromLocation} → ${result.toLocation}`,
    );
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Stock Transfer"]}
        title="Stock Transfer"
        subtitle="โอนย้ายสินค้าระหว่างสถานที่"
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{ color: toast.startsWith("โอน") ? c.pos : c.neg }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + โอนสินค้า
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "โอนทั้งหมด",
              value: stockTransfers.length,
              sub: "รายการ",
              tone: c.ink,
            },
            {
              label: "ชิ้นที่โอน",
              value: stockTransfers.reduce((s, tr) => s + tr.qty, 0),
              sub: "ชิ้น",
              tone: c.info,
            },
            {
              label: "สถานที่ปลายทาง",
              value: new Set(stockTransfers.map((tr) => tr.toLocation)).size,
              sub: "แห่ง",
              tone: c.accent,
            },
            {
              label: "โอนวันนี้",
              value: stockTransfers.filter(
                (tr) => tr.date === new Date().toISOString().split("T")[0],
              ).length,
              sub: "รายการ",
              tone: c.pos,
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

        {/* History Table */}
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
            ประวัติการโอนย้าย
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
                    เลขที่
                  </TableHead>
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
                    จำนวน
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    จาก
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    ไปยัง
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    วันที่
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    ผู้โอน
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    หมายเหตุ
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockTransfers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="p-12 text-center text-sm"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ยังไม่มีรายการโอน
                    </TableCell>
                  </TableRow>
                )}
                {stockTransfers.map((tr) => (
                  <TableRow
                    key={tr.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <TableCell
                      className="p-4 px-5 align-middle text-xs font-semibold font-mono"
                      style={{ color: "var(--erp-accent)" }}
                    >
                      {tr.id}
                    </TableCell>
                    <TableCell
                      className="p-4 px-5 align-middle text-sm font-semibold"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {tr.skuName}
                    </TableCell>
                    <TableCell
                      className="p-4 px-5 align-middle text-sm font-bold font-mono"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {tr.qty} ชิ้น
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          background: "var(--erp-subtle)",
                          borderColor: "var(--erp-border)",
                          color: "var(--erp-ink2)",
                        }}
                      >
                        {tr.fromLocation}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          background:
                            "var(--erp-info-subtle, rgba(59, 130, 246, 0.1))",
                          borderColor:
                            "var(--erp-info-border, rgba(59, 130, 246, 0.2))",
                          color: "var(--erp-info)",
                        }}
                      >
                        → {tr.toLocation}
                      </span>
                    </TableCell>
                    <TableCell
                      className="p-4 px-5 align-middle text-xs"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      {tr.date}
                    </TableCell>
                    <TableCell
                      className="p-4 px-5 align-middle text-xs"
                      style={{ color: "var(--erp-ink2)" }}
                    >
                      {tr.transferredBy}
                    </TableCell>
                    <TableCell
                      className="p-4 px-5 align-middle text-xs max-w-[150px] truncate"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      {tr.note || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <CreateTransferSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        onSubmit={handleTransferSubmit}
        showToast={showToast}
      />
    </div>
  );
}

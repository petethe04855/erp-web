"use client";

import { useMemo, useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { exportXlsx } from "@/lib/utils/exportUtil";
import type { ReturnReason, ReturnCondition } from "@/lib/store/erpWorkflow";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, StatusPill, TopBar, fmtBaht } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { NewReturnSheet } from "./components/NewReturnSheet";

const REASONS: ReturnReason[] = ["สินค้าชำรุด", "ผิดสินค้า", "ลูกค้าเปลี่ยนใจ", "ผิดขนาด/รุ่น", "อื่นๆ"];

export default function ReturnsPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const salesOrders = useErpStore((s) => s.salesOrders);
  const stockReturns = useErpStore((s) => s.stockReturns);
  const products = useErpStore((s) => s.products);
  const createStockReturn = useErpStore((s) => s.createStockReturn);
  const updateStockReturnStatus = useErpStore((s) => s.updateStockReturnStatus);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const rows = useMemo(() => {
    return stockReturns.map((ret) => {
      const product = products.find((p) => p.sku === ret.sku);
      const so = salesOrders.find((o) => o.id === ret.soRef);
      const amount = (product?.price ?? 0) * ret.qty;
      const status = ret.status
        ? ret.status.toLowerCase()
        : ret.refunded
        ? "completed"
        : "pending";
      return {
        ...ret,
        customer: so?.customer ?? "Walk-in / Manual",
        amount,
        status,
      };
    });
  }, [stockReturns, products, salesOrders]);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const openCount = rows.filter(
    (r) => r.status !== "completed" && r.status !== "cancelled"
  ).length;

  const topReason = useMemo(() => {
    return REASONS.map((reason) => ({
      reason,
      count: stockReturns.filter((r) => r.reason === reason).length,
    })).sort((a, b) => b.count - a.count)[0];
  }, [stockReturns]);

  function handleCreateReturn(data: {
    soRef: string;
    sku: string;
    qty: number;
    condition: ReturnCondition;
    reason: ReturnReason;
    note: string;
    channel: string;
  }) {
    const result = createStockReturn(data);
    showToast(`รับคืน ${result.id} แล้ว · สถานะ: รอดำเนินการ`);
  }

  function handleUpdateStatus(id: string, newStatus: "Completed" | "Cancelled") {
    updateStockReturnStatus(id, newStatus);
    showToast(
      `อัปเดต ${id} เป็น ${newStatus === "Completed" ? "ของกลับมาแล้ว" : "ยกเลิก"} สำเร็จ`
    );
  }

  async function handleExport() {
    try {
      await exportXlsx(
        "returns",
        `returns-export-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      showToast("Export สำเร็จ");
    } catch (err: any) {
      showToast("Export ล้มเหลว: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Sales", "Returns"]}
        title="Returns"
        subtitle={`คืนสินค้า · ${rows.length} รายการ · ${fmtBaht(total)} มูลค่ารวม`}
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
            <Button variant="outline" onClick={handleExport} className="cursor-pointer">
              Export
            </Button>
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + New Return
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1320px] mx-auto grid gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total value",
              value: fmtBaht(total),
              sub: "this month",
            },
            {
              label: "Open RMAs",
              value: String(openCount),
              sub: "awaiting action",
              tone: openCount ? c.warn : undefined,
            },
            {
              label: "Return rate",
              value: `${((rows.length / Math.max(1, salesOrders.length)) * 100).toFixed(1)}%`,
              sub: "of orders",
            },
            {
              label: "Top reason",
              value: topReason?.reason ?? "—",
              sub: `${topReason?.count ?? 0} returns`,
            },
          ].map((tile) => (
            <Card
              t={t}
              key={tile.label}
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
                {tile.label}
              </div>
              <span className="block mt-2">
                <Mono
                  t={t}
                  size={22}
                  weight={600}
                  color={tile.tone ? tile.tone : c.ink}
                >
                  {tile.value}
                </Mono>
              </span>
              <div
                className="text-xs text-muted-foreground mt-1"
                style={{ color: "var(--erp-ink3)" }}
              >
                {tile.sub}
              </div>
            </Card>
          ))}
        </div>

        {/* Returns Table */}
        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
          style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
        >
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}
              >
                <TableRow>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>RMA</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>SO Ref</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Customer</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Channel</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Date</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Reason</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>Qty</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>Amount</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Status</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} weight={500}>
                        {r.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={r.soRef ? c.accent : c.ink3}>
                        {r.soRef || "—"}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span className="text-sm font-medium" style={{ color: "var(--erp-ink)" }}>
                        {r.customer}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span className="text-sm font-medium" style={{ color: "var(--erp-ink2)" }}>
                        {r.channel}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {r.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium" style={{ color: "var(--erp-ink)" }}>
                          {r.reason}
                        </span>
                        <span className="text-xs" style={{ color: "var(--erp-ink3)" }}>
                          {r.condition}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        {r.qty}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={13} weight={600}>
                        {fmtBaht(r.amount)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <StatusPill t={t} status={r.status} />
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateStatus(r.id, "Completed")}
                            className="h-7 text-xs px-2.5 cursor-pointer bg-[var(--erp-accent)] text-white border-none"
                          >
                            ของกลับมาแล้ว
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateStatus(r.id, "Cancelled")}
                            className="h-7 text-xs px-2.5 cursor-pointer"
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <NewReturnSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        salesOrders={salesOrders}
        onSubmit={handleCreateReturn}
        showToast={showToast}
      />
    </div>
  );
}

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

const REASONS: ReturnReason[] = [
  "สินค้าชำรุด",
  "ผิดสินค้า",
  "ลูกค้าเปลี่ยนใจ",
  "ผิดขนาด/รุ่น",
  "อื่นๆ",
];

export default function ReturnsPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const salesOrders = useErpStore((s) => s.salesOrders);
  const stockReturns = useErpStore((s) => s.stockReturns);
  const products = useErpStore((s) => s.products);
  const createStockReturn = useErpStore((s) => s.createStockReturn);
  const updateStockReturnStatus = useErpStore((s) => s.updateStockReturnStatus);
  const stockLots = useErpStore((s) => s.stockLots);
  const expiredLots = stockLots.filter((lot) => lot.remainingQty > 0 && lot.expiryDate && lot.expiryDate < new Date().toISOString().slice(0, 10)).length;

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const rows = useMemo(() => {
    return stockReturns.map((ret) => {
      const product = products.find((p) => p.sku === ret.sku);
      const so = salesOrders.find((o) => o.id === ret.soRef || o.code === ret.soRef);
      const amount = ret.creditAmount || (product?.price ?? 0) * ret.qty;
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
    (r) => r.status !== "completed" && r.status !== "cancelled",
  ).length;

  const topReason = useMemo(() => {
    return REASONS.map((reason) => ({
      reason,
      count: stockReturns.filter((r) => r.reason === reason).length,
    })).sort((a, b) => b.count - a.count)[0];
  }, [stockReturns]);

  async function handleCreateReturn(data: {
    soRef: string;
    sku: string;
    qty: number;
    condition: ReturnCondition;
    reason: ReturnReason;
    note: string;
    channel: string;
  }) {
    const result = await createStockReturn(data);
    showToast(`รับคืน ${result.id} แล้ว · สถานะ: รอดำเนินการ`);
  }

  function handleUpdateStatus(
    id: string,
    newStatus: "Approved" | "QC Passed" | "Cancelled",
  ) {
    updateStockReturnStatus(id, newStatus);
    showToast(
      `อัปเดต ${id} สำเร็จ`,
    );
  }

  async function handleReverseCreditNote(ref: string) {
    if (!window.confirm(`ยืนยันการกลับรายการ ${ref} หรือไม่?`)) return;
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const token = localStorage.getItem("chawy_token") || "";
    const response = await fetch(`${api}/api/credit-notes/${ref}/reverse`, { method: "PUT", headers: { Authorization: token ? `Bearer ${token}` : "" } });
    if (!response.ok) { showToast("ไม่สามารถกลับรายการ Credit Note ได้"); return; }
    await useErpStore.getState().loadResources(["stockReturns"], true);
    showToast(`กลับรายการ ${ref} สำเร็จ`);
  }

  async function handleExport() {
    try {
      await exportXlsx(
        "returns",
        `returns-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      showToast("Export สำเร็จ");
    } catch (err: any) {
      showToast("Export ล้มเหลว: " + err.message);
    }
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
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
            <Button
              variant="outline"
              onClick={handleExport}
              className="cursor-pointer"
            >
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

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {expiredLots > 0 && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">พบ Lot หมดอายุที่ยังมี Stock {expiredLots} รายการ สินค้าคืนต้องผ่านการตรวจสอบก่อนนำกลับเข้าคลัง</div>}
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
                    RMA
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    SO Ref
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Customer
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Channel
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Date
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Reason
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Qty
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Amount
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left">
                    Credit Note / Lot
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Actions
                  </TableHead>
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
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {r.customer}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--erp-ink2)" }}
                      >
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
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {r.reason}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--erp-ink3)" }}
                        >
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
                      <div className="font-mono text-xs font-semibold">{r.creditNoteRef || "–"}</div>
                      {r.creditNoteRef && <div className="text-[10px] text-muted-foreground">ก่อน VAT {fmtBaht(r.creditSubtotal || r.amount)} · VAT {fmtBaht(r.creditVatAmount || 0)} · ส่วนลด {fmtBaht(r.creditDiscount || 0)}</div>}
                      {r.allocations?.map((allocation) => (
                        <div key={allocation.id} className="text-xs text-muted-foreground">
                          {allocation.lot} · {allocation.qty} ชิ้น · {allocation.restocked ? "คืนสต๊อก" : "เสียหาย"}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <StatusPill t={t} status={r.status} />
                      {r.status === "qc pending" && <div className="mt-1 text-[10px] text-amber-700">Quarantine: {r.quarantineQty || r.qty}</div>}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      {r.status === "pending approval" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleUpdateStatus(r.id, "Approved")
                            }
                            className="h-7 text-xs px-2.5 cursor-pointer bg-[var(--erp-accent)] text-white border-none"
                          >
                            อนุมัติการคืน
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(r.id, "Cancelled")
                            }
                            className="h-7 text-xs px-2.5 cursor-pointer"
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      )}
                      {r.status === "qc pending" && <div className="flex gap-2"><Button onClick={() => handleUpdateStatus(r.id, "QC Passed")} className="h-7 text-xs px-2.5 cursor-pointer bg-[var(--erp-accent)] text-white border-none">ผ่าน QC / รับเข้าสต็อก</Button><Button variant="outline" onClick={() => handleUpdateStatus(r.id, "Cancelled")} className="h-7 text-xs px-2.5 cursor-pointer">ไม่ผ่าน QC</Button></div>}
                      {r.status === "completed" && r.creditNoteRef && <Button variant="outline" onClick={() => handleReverseCreditNote(r.creditNoteRef!)} className="h-7 text-xs px-2.5 cursor-pointer">Reverse CN</Button>}
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
        stockReturns={stockReturns}
        onSubmit={handleCreateReturn}
        showToast={showToast}
      />
    </div>
  );
}

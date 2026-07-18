"use client";

import { useMemo, useState } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import type { PurchaseOrderStatus } from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, StatusPill, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CreatePOSheet } from "./components/CreatePOSheet";

const statusMap: Record<PurchaseOrderStatus, string> = {
  Draft: "draft",
  Sent: "sent",
  "Partial Received": "pending",
  Completed: "completed",
};

export default function PurchaseOrderPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const list = useErpStore((s) => s.purchaseOrders);
  const products = useErpStore((s) => s.products);
  const createPO = useErpStore((s) => s.createPurchaseOrder);
  const updatePOStatus = useErpStore((s) => s.updatePOStatus);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const rows = useMemo(() => {
    return list.map((po) => ({
      ...po,
      openValue: po.status === "Completed" ? 0 : po.totalCost,
    }));
  }, [list]);

  const total = rows.reduce((s, p) => s + p.totalCost, 0);
  const openValue = rows.reduce((s, p) => s + p.openValue, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleCreatePO(data: {
    supplier: string;
    etaDate: string;
    items: { sku: string; name: string; qty: number; unitCost: number }[];
  }) {
    const po = createPO(data);
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
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Purchasing", "Purchase Orders"]}
        title="Purchase Orders"
        subtitle={`ใบสั่งซื้อ · ${rows.length} รายการ · ${formatBaht(
          openValue,
        )} ค้างรับ`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{
                  color: toast.includes("กรุณา") ? c.neg : c.pos,
                }}
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
              + New PO
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
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
            {
              label: "Overdue POs",
              value: "0",
              sub: "past ETA",
              tone: c.neg,
            },
            {
              label: "Suppliers",
              value: String(new Set(rows.map((p) => p.supplier)).size),
              sub: "active",
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

        {/* PO Table */}
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
                    PO
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Supplier
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Order date
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    ETA
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Items
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Amount
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
                {rows.map((po) => (
                  <TableRow
                    key={po.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <TableCell className="p-4 px-5 align-middle">
                      <div className="flex items-center gap-2">
                        <Mono t={t} size={12} weight={500}>
                          {po.id}
                        </Mono>
                        {po.status === "Draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(po.id, "Sent")}
                            className="h-6 text-[10px] px-2.5 cursor-pointer"
                          >
                            Send
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {po.supplier}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {po.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {po.etaDate}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        {po.items.length}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={13} weight={600}>
                        {formatBaht(po.totalCost)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <StatusPill t={t} status={statusMap[po.status]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <CreatePOSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        onSubmit={handleCreatePO}
        showToast={showToast}
      />
    </div>
  );
}

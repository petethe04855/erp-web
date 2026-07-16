"use client";

import { useMemo, useState } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
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
import type { LandedCostLine } from "@/lib/store/erpWorkflow";
import { ReceiveGoodsSheet } from "./components/ReceiveGoodsSheet";
import { ViewGoodsReceiveSheet } from "./components/ViewGoodsReceiveSheet";

export default function GoodsReceivePage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const grList = useErpStore((s) => s.goodsReceives);
  const poList = useErpStore((s) => s.purchaseOrders);
  const createGR = useErpStore((s) => s.createGoodsReceive);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGR, setSelectedGR] = useState<any | null>(null);
  const [toast, setToast] = useState("");

  const eligiblePOs = poList.filter(
    (po) => po.status === "Sent" || po.status === "Partial Received"
  );

  const rows = useMemo(() => {
    return grList.map((gr) => {
      const po = poList.find((p) => p.id === gr.poRef);
      const value = gr.items.reduce((sum, item) => {
        const poItem = po?.items.find((i) => i.sku === item.sku);
        return sum + item.qtyReceived * (poItem?.unitCost ?? 0);
      }, 0);

      const landedValue = gr.items.reduce((sum, item) => {
        const unitCost =
          item.landedUnitCost ||
          po?.items.find((i) => i.sku === item.sku)?.unitCost ||
          0;
        return sum + item.qtyReceived * unitCost;
      }, 0);

      const qty = gr.items.reduce((sum, item) => sum + item.qtyReceived, 0);
      return {
        ...gr,
        supplier: po?.supplier ?? "Unknown supplier",
        value,
        landedValue,
        qty,
        status: po?.status === "Partial Received" ? "pending" : "completed",
      };
    });
  }, [grList, poList]);

  const total = rows.reduce((s, g) => s + g.value, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleCreateGR(data: {
    poRef: string;
    receiveDate: string;
    items: { sku: string; qtyReceived: number; lot: string; expiryDate: string }[];
    landedCosts: LandedCostLine[];
  }) {
    const gr = createGR({
      poRef: data.poRef,
      receiveDate: data.receiveDate,
      items: data.items,
      landedCosts: data.landedCosts,
    });
    if (!gr) {
      showToast("ไม่สามารถรับสินค้าได้");
      return false;
    }
    showToast(`สร้าง ${gr.id} แล้ว · อัปเดต LOT/stock และคำนวณ Landed Cost`);
    return true;
  }

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Goods Receive"]}
        title="Goods Receive"
        subtitle={`รับสินค้าเข้า · ${rows.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{
                  color:
                    toast.includes("ไม่") || toast.includes("กรุณา")
                      ? c.neg
                      : c.pos,
                }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + Receive Goods
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1320px] mx-auto grid gap-6">
        <StatStrip
          t={t}
          tiles={[
            {
              label: "Received · MTD",
              value: formatBaht(total),
              sub: `${rows.length} receipts`,
            },
            {
              label: "Pending QC",
              value: String(rows.filter((g) => g.status === "pending").length),
              sub: "partial receipts",
              tone: c.warn,
            },
            {
              label: "Suppliers",
              value: String(new Set(rows.map((g) => g.supplier)).size),
              sub: "this month",
            },
            { label: "On-time rate", value: "92%", sub: "vs ETA" },
          ]}
        />

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
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                    GR
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                    PO Ref
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                    Supplier
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                    Date
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>
                    Items
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                    Quantity
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>
                    Base Value
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>
                    Landed Value
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((g) => (
                  <TableRow
                    key={g.id}
                    onClick={() => setSelectedGR(g)}
                    className="hover:bg-muted/50 transition-colors border-b border-border cursor-pointer"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} weight={500}>
                        {g.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.accent}>
                        {g.poRef}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle font-medium text-foreground" style={{ color: "var(--erp-ink)" }}>
                      {g.supplier}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {g.receiveDate}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        {g.items.length}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {g.qty}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={13} color={c.ink3}>
                        {formatBaht(g.value)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono
                        t={t}
                        size={13}
                        weight={600}
                        color={g.landedValue > g.value ? c.accent : c.ink}
                      >
                        {formatBaht(g.landedValue)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Badge variant={g.status === "pending" ? "low" : "normal"}>
                        {g.status === "pending" ? "Pending" : "Completed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <ReceiveGoodsSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        eligiblePOs={eligiblePOs}
        onSubmit={handleCreateGR}
        showToast={showToast}
      />

      <ViewGoodsReceiveSheet
        selectedGR={selectedGR}
        onClose={() => setSelectedGR(null)}
        poList={poList}
      />
    </div>
  );
}

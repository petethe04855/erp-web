"use client";

import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { exportXlsx } from "@/lib/utils/exportUtil";
import {
  Card,
  Mono,
  StatusPill,
  TopBar,
  fmtBaht,
  fmtNum,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type SettlementRecord = {
  orderId: string;
  netIncome: number;
  totalFee: number;
  settlementRef: string;
};

function orderStatus(status: string) {
  if (status === "COMPLETED" || status === "DELIVERED") return "completed";
  if (status === "AWAITING_SHIPMENT") return "pending";
  if (status === "IN_TRANSIT") return "shipped";
  if (status === "CANCELLED") return "cancelled";
  return status;
}

export default function TikTokOrdersPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const tiktokOrders = useErpStore((s) => s.tiktokOrders);
  const liveSessions = useErpStore((s) => s.liveSessions);
  const applyTiktokSettlement = useErpStore((s) => s.applyTiktokSettlement);

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const activeOrders = tiktokOrders.filter((o) => o.status !== "CANCELLED");
  const totalGmv = activeOrders.reduce((s, o) => s + o.amount, 0);
  const pending = tiktokOrders.filter(
    (o) => o.status === "AWAITING_SHIPMENT",
  ).length;
  const avgOrder = activeOrders.length ? totalGmv / activeOrders.length : 0;

  async function handleSyncSettlement() {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("tiktok_access_token")
        : null;
    if (!token) {
      setSyncMsg("กรุณาตั้งค่า Access Token ที่หน้า TikTok Setup ก่อน");
      return;
    }
    setSyncing(true);
    setSyncMsg(null);
    try {
      const authToken = localStorage.getItem("chawy_token");
      const res = await fetch(
        `/api/tiktok/settlement?access_token=${encodeURIComponent(token)}`,
        {
          headers: { Authorization: authToken ? `Bearer ${authToken}` : "" },
        },
      );
      const json = (await res.json()) as {
        settlements?: SettlementRecord[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "API error");
      const records = json.settlements ?? [];
      let matched = 0;
      for (const rec of records) {
        const result = applyTiktokSettlement({
          orderId: rec.orderId,
          netRevenue: rec.netIncome,
          platformFee: rec.totalFee,
          settlementRef: rec.settlementRef,
        });
        if (result) matched++;
      }
      setSyncMsg(`Sync สำเร็จ — อัปเดต ${matched} / ${records.length} รายการ`);
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSyncing(false);
    }
  }

  async function handleExport() {
    try {
      await exportXlsx(
        "tiktok-orders",
        `tiktok-orders-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      setSyncMsg("Export สำเร็จ");
    } catch (err: any) {
      setSyncMsg("Export ล้มเหลว: " + err.message);
    }
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Channels", "TikTok Orders"]}
        title="TikTok Shop"
        subtitle="ออร์เดอร์และไลฟ์ TikTok · พฤษภาคม 2026"
        right={
          <div className="flex items-center gap-2">
            {syncMsg && (
              <span
                className="text-xs font-semibold pr-2"
                style={{
                  color:
                    syncMsg.startsWith("Sync สำเร็จ") ||
                    syncMsg.startsWith("Export สำเร็จ")
                      ? c.pos
                      : c.neg,
                }}
              >
                {syncMsg}
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
              onClick={handleSyncSettlement}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              {syncing ? "Syncing..." : "Sync Settlement"}
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "GMV · last live",
              value: fmtBaht(liveSessions[0]?.revenue_generated ?? totalGmv),
              sub: liveSessions[0]?.live_date?.slice(5) ?? "latest",
            },
            {
              label: "GMV · MTD",
              value: fmtBaht(totalGmv),
              sub: `${liveSessions.length || 1} sessions`,
            },
            {
              label: "Avg. order",
              value: fmtBaht(avgOrder),
              sub: "gross / order",
            },
            {
              label: "Orders pending",
              value: fmtNum(pending),
              sub: "awaiting shipment",
              tone: pending ? c.warn : c.ink,
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

        {/* Recent Live Sessions Table */}
        {liveSessions.length > 0 && (
          <div className="flex flex-col gap-2">
            <div
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1"
              style={{ color: "var(--erp-ink3)" }}
            >
              Recent Live Sessions
            </div>
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
                        Date
                      </TableHead>
                      <TableHead
                        className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        Host
                      </TableHead>
                      <TableHead
                        className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        Status
                      </TableHead>
                      <TableHead
                        className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        Orders
                      </TableHead>
                      <TableHead
                        className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        GMV
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveSessions.slice(0, 5).map((session) => {
                      return (
                        <TableRow
                          key={session.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                          style={{ borderColor: "var(--erp-border)" }}
                        >
                          <TableCell className="p-4 px-5 align-middle">
                            <Mono t={t} size={12} weight={500}>
                              {session.live_date}
                            </Mono>
                          </TableCell>
                          <TableCell
                            className="p-4 px-5 align-middle text-sm font-semibold"
                            style={{ color: "var(--erp-ink)" }}
                          >
                            {session.tiktok_account}
                          </TableCell>
                          <TableCell className="p-4 px-5 align-middle">
                            <StatusPill
                              t={t}
                              status={
                                session.status === "Manager_Approved"
                                  ? "completed"
                                  : "pending"
                              }
                            />
                          </TableCell>
                          <TableCell className="p-4 px-5 align-middle text-right font-mono text-sm">
                            {Math.max(
                              1,
                              Math.round(
                                session.revenue_generated /
                                  Math.max(avgOrder, 1),
                              ),
                            )}
                          </TableCell>
                          <TableCell className="p-4 px-5 align-middle text-right">
                            <Mono t={t} size={13} weight={600}>
                              {fmtBaht(session.revenue_generated)}
                            </Mono>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {/* Order Feed Table */}
        <div className="flex flex-col gap-2">
          <div
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1"
            style={{ color: "var(--erp-ink3)" }}
          >
            Order Feed
          </div>
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
                      Order
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Handle
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Product
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
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Net
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
                  {tiktokOrders.map((order) => {
                    return (
                      <TableRow
                        key={order.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                        style={{ borderColor: "var(--erp-border)" }}
                      >
                        <TableCell className="p-4 px-5 align-middle">
                          <Mono t={t} size={12} weight={500}>
                            {order.id}
                          </Mono>
                        </TableCell>
                        <TableCell
                          className="p-4 px-5 align-middle text-xs font-semibold"
                          style={{ color: "var(--erp-accent)" }}
                        >
                          @tiktok
                        </TableCell>
                        <TableCell
                          className="p-4 px-5 align-middle text-sm font-semibold"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {order.product}
                          <div
                            className="text-[11px] font-normal font-mono mt-0.5"
                            style={{ color: "var(--erp-ink3)" }}
                          >
                            {order.sku}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-right">
                          <Mono t={t} size={12} color={c.ink2}>
                            {order.qty}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-right">
                          <Mono t={t} size={13} weight={600}>
                            {fmtBaht(order.amount)}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle text-right">
                          <Mono
                            t={t}
                            size={12}
                            color={order.settled ? c.pos : c.ink3}
                          >
                            {order.settled
                              ? fmtBaht(order.netRevenue ?? 0)
                              : "—"}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-4 px-5 align-middle">
                          <StatusPill
                            t={t}
                            status={orderStatus(order.status)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

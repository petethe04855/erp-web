"use client";
import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { exportXlsx } from "@/lib/utils/exportUtil";
import {
  Card,
  Mono,
  SectionLabel,
  StatStrip,
  TopBar,
  fmtBaht,
  fmtNum,
} from "@/components/ui";
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

function getBadge(status: string) {
  const norm = orderStatus(status);
  if (norm === "completed") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
        Completed
      </Badge>
    );
  }
  if (norm === "pending") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
        Pending
      </Badge>
    );
  }
  if (norm === "shipped") {
    return (
      <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20">
        Shipped
      </Badge>
    );
  }
  if (norm === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
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
  const netTotal = activeOrders
    .filter((o) => o.settled)
    .reduce((s, o) => s + (o.netRevenue ?? 0), 0);
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
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Channels", "TikTok Orders"]}
        title="TikTok Shop"
        subtitle="ออร์เดอร์และไลฟ์ TikTok · พฤษภาคม 2026"
        right={
          <>
            {syncMsg && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: syncMsg.startsWith("Sync สำเร็จ") ? c.pos : c.neg,
                }}
              >
                {syncMsg}
              </span>
            )}
            <Button variant="outline" onClick={handleExport}>
              Export
            </Button>
            <Button onClick={handleSyncSettlement}>
              {syncing ? "Syncing..." : "Sync Settlement"}
            </Button>
          </>
        }
      />

      <div style={{ padding: "24px 32px 48px" }}>
        <StatStrip
          t={t}
          tiles={[
            {
              label: "GMV · last live",
              value: fmtBaht(liveSessions[0]?.revenue_generated ?? totalGmv),
              sub: liveSessions[0]?.live_date?.slice(5) ?? "latest",
              tone: c.ink,
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
          ]}
        />

        {liveSessions.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel t={t}>Recent Live Sessions</SectionLabel>
            <Card t={t} pad={false} style={{ overflow: "auto" }}>
              <Table className="min-w-[840px]">
                <TableHeader>
                  <TableRow>
                    {["Date", "Host", "Status"].map((h) => (
                      <TableHead
                        key={h}
                        className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </TableHead>
                    ))}
                    <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Orders
                    </TableHead>
                    <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      GMV
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveSessions.slice(0, 5).map((session) => {
                    return (
                      <TableRow key={session.id}>
                        <TableCell className="py-3.5 px-6">
                          <Mono t={t} size={12} weight={500}>
                            {session.live_date}
                          </Mono>
                        </TableCell>
                        <TableCell className="py-3.5 px-6">
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: c.ink,
                            }}
                          >
                            {session.tiktok_account}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-6">
                          {session.status === "Manager_Approved" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-right">
                          <Mono t={t} size={12}>
                            {Math.max(
                              1,
                              Math.round(
                                session.revenue_generated /
                                  Math.max(avgOrder, 1),
                              ),
                            )}
                          </Mono>
                        </TableCell>
                        <TableCell className="py-3.5 px-6 text-right">
                          <Mono t={t} size={13} weight={600}>
                            {fmtBaht(session.revenue_generated)}
                          </Mono>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        <SectionLabel t={t}>Order Feed</SectionLabel>
        <Card t={t} pad={false} style={{ overflow: "auto" }}>
          <Table className="min-w-[1040px]">
            <TableHeader>
              <TableRow>
                {["Order", "Handle", "Product"].map((h) => (
                  <TableHead
                    key={h}
                    className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Qty
                </TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Net
                </TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiktokOrders.map((order) => {
                return (
                  <TableRow key={order.id}>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} weight={500}>
                        {order.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span
                        style={{
                          fontSize: 12,
                          color: c.accent,
                          fontWeight: 500,
                        }}
                      >
                        @tiktok
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 13, color: c.ink }}>
                        {order.product}
                      </span>
                      <div style={{ fontSize: 11, color: c.ink3 }}>
                        {order.sku}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        {order.qty}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={13} weight={600}>
                        {fmtBaht(order.amount)}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono
                        t={t}
                        size={12}
                        color={order.settled ? c.pos : c.ink3}
                      >
                        {order.settled ? fmtBaht(order.netRevenue ?? 0) : "—"}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {getBadge(order.status)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { exportXlsx } from "@/lib/utils/exportUtil";
import { Card, Mono, TopBar, fmtBaht, fmtNum } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SettlementRecord = { orderId: string; netIncome: number; totalFee: number; settlementRef: string };

const STATUS_LABEL: Record<string, string> = {
  AWAITING_SHIPMENT: "รอจัดส่ง",
  UNPAID: "ยังไม่ชำระเงิน",
  ON_HOLD: "พักคำสั่งซื้อ",
  AWAITING_COLLECTION: "รอรับพัสดุ",
  PARTIALLY_SHIPPING: "จัดส่งบางส่วน",
  IN_TRANSIT: "กำลังจัดส่ง",
  DELIVERED: "จัดส่งแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

const STATUS_VARIANT: Record<string, "low" | "secondary" | "normal" | "empty"> = {
  AWAITING_SHIPMENT: "low",
  UNPAID: "low",
  ON_HOLD: "low",
  AWAITING_COLLECTION: "secondary",
  PARTIALLY_SHIPPING: "secondary",
  IN_TRANSIT: "secondary",
  DELIVERED: "normal",
  COMPLETED: "normal",
  CANCELLED: "empty",
};

export default function TikTokOrdersPage() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const c = t.color;
  const tiktokOrders = useErpStore((state) => state.tiktokOrders);
  const applyTiktokSettlement = useErpStore((state) => state.applyTiktokSettlement);
  const loadResources = useErpStore((state) => state.loadResources);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [syncing, setSyncing] = useState(false);
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return [...tiktokOrders]
      .filter((order) => status === "ALL" || order.status === status)
      .filter((order) => !keyword || [order.id, order.product, order.sku].some((value) => value.toLowerCase().includes(keyword)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [search, status, tiktokOrders]);

  const activeOrders = tiktokOrders.filter((order) => order.status !== "CANCELLED");
  const totalGmv = activeOrders.reduce((sum, order) => sum + order.amount, 0);
  const totalQty = activeOrders.reduce((sum, order) => sum + order.qty, 0);
  const pending = tiktokOrders.filter((order) => order.status === "AWAITING_SHIPMENT").length;
  const settled = tiktokOrders.filter((order) => order.settled).length;

  const productSummary = useMemo(() => {
    const products = new Map<string, { sku: string; product: string; orders: number; qty: number; amount: number }>();
    for (const order of tiktokOrders.filter((item) => item.status !== "CANCELLED")) {
      const lines = order.items?.length ? order.items : [{ sku: order.sku, productName: order.product, qty: order.qty, amount: order.amount }];
      for (const line of lines) {
        const current = products.get(line.sku) ?? { sku: line.sku, product: line.productName, orders: 0, qty: 0, amount: 0 };
        current.orders += 1;
        current.qty += line.qty;
        current.amount += line.amount;
        products.set(line.sku, current);
      }
    }
    return [...products.values()].sort((a, b) => b.amount - a.amount);
  }, [tiktokOrders]);

  async function handleSyncOrders() {
    setSyncingOrders(true);
    setSyncMsg(null);
    try {
      const token = localStorage.getItem("chawy_token") || "";
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${api}/api/tiktok/orders/sync?days=30`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const result = await response.json() as { synced?: number; error?: string };
      if (!response.ok) throw new Error(result.error || "ไม่สามารถ Sync Orders ได้");
      await loadResources(["tiktokOrders"], true);
      setSyncMsg(`Sync Orders สำเร็จ — ${result.synced ?? 0} ออเดอร์`);
    } catch (reason) {
      setSyncMsg(reason instanceof Error ? reason.message : "ไม่สามารถ Sync Orders ได้");
    } finally {
      setSyncingOrders(false);
    }
  }

  async function handleSyncSettlement() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const authToken = localStorage.getItem("chawy_token");
      const response = await fetch("/api/tiktok/settlement", { headers: { Authorization: authToken ? `Bearer ${authToken}` : "" } });
      const result = (await response.json()) as { settlements?: SettlementRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "API error");
      const records = result.settlements ?? [];
      let matched = 0;
      for (const record of records) {
        if (applyTiktokSettlement({ orderId: record.orderId, netRevenue: record.netIncome, platformFee: record.totalFee, settlementRef: record.settlementRef })) matched += 1;
      }
      setSyncMsg(`Sync สำเร็จ — อัปเดต ${matched} / ${records.length} รายการ`);
    } catch (reason) {
      setSyncMsg(reason instanceof Error ? reason.message : "ไม่สามารถ Sync Settlement ได้");
    } finally {
      setSyncing(false);
    }
  }

  async function handleExport() {
    try {
      await exportXlsx("tiktok-orders", `tiktok-orders-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
      setSyncMsg("Export สำเร็จ");
    } catch (reason) {
      setSyncMsg(`Export ล้มเหลว: ${reason instanceof Error ? reason.message : "Unknown error"}`);
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Channels", "TikTok Orders"]}
        title="คำสั่งซื้อ TikTok"
        subtitle={`รายการคำสั่งซื้อสินค้า · ${tiktokOrders.length.toLocaleString("th-TH")} ออเดอร์`}
        right={<div className="flex items-center gap-2">
          {syncMsg && <span className="pr-2 text-xs font-semibold" style={{ color: syncMsg.includes("สำเร็จ") ? c.pos : c.neg }}>{syncMsg}</span>}
          <Button variant="outline" onClick={handleExport}>Export</Button>
          <Button variant="outline" onClick={handleSyncSettlement} disabled={syncing || syncingOrders}>{syncing ? "กำลัง Sync..." : "Sync Settlement"}</Button>
          <Button onClick={handleSyncOrders} disabled={syncingOrders || syncing} className="bg-[var(--erp-accent)] text-white hover:opacity-90">{syncingOrders ? "กำลังดึง Orders..." : "Sync Orders"}</Button>
        </div>}
      />

      <div className="mx-auto grid max-w-full gap-6 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "คำสั่งซื้อทั้งหมด", value: fmtNum(tiktokOrders.length), sub: `${activeOrders.length} ออเดอร์ที่ไม่ถูกยกเลิก` },
            { label: "จำนวนสินค้าที่ขาย", value: fmtNum(totalQty), sub: `${productSummary.length} SKU` },
            { label: "ยอดขายรวม", value: fmtBaht(totalGmv), sub: "ไม่รวมออเดอร์ยกเลิก" },
            { label: "รอจัดส่ง", value: fmtNum(pending), sub: `Settlement แล้ว ${settled} ออเดอร์`, tone: pending ? c.warn : c.ink },
          ].map((tile) => <Card key={tile.label} t={t} className="border border-border bg-card p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: c.ink3 }}>{tile.label}</div>
            <span className="mt-2 block"><Mono t={t} size={22} weight={600} color={tile.tone ?? c.ink}>{tile.value}</Mono></span>
            <div className="mt-1 text-xs" style={{ color: c.ink3 }}>{tile.sub}</div>
          </Card>)}
        </div>

        {productSummary.length > 0 && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {productSummary.slice(0, 4).map((product) => <Card key={product.sku} t={t} className="border border-border bg-card p-4">
            <div className="truncate text-sm font-semibold" title={product.product}>{product.product}</div>
            <div className="mt-1 font-mono text-[11px]" style={{ color: c.ink3 }}>{product.sku}</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="text-xs" style={{ color: c.ink3 }}>{product.orders} ออเดอร์ · {product.qty} ชิ้น</div>
              <Mono t={t} size={13} weight={600}>{fmtBaht(product.amount)}</Mono>
            </div>
          </Card>)}
        </div>}

        <Card t={t} pad={false} className="overflow-hidden border border-border bg-card">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="font-semibold">รายการคำสั่งซื้อ</div><div className="text-xs" style={{ color: c.ink3 }}>แสดง {filteredOrders.length.toLocaleString("th-TH")} จาก {tiktokOrders.length.toLocaleString("th-TH")} รายการ</div></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input className="sm:w-72" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขออเดอร์ สินค้า หรือ SKU" />
              <NativeSelect className="sm:w-44" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="ALL">ทุกสถานะ</option>
                {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </NativeSelect>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="border-b bg-muted/50"><TableRow>
                <TableHead className="px-5 py-3">วันที่ / คำสั่งซื้อ</TableHead><TableHead className="px-5 py-3">สินค้า</TableHead><TableHead className="px-5 py-3 text-right">จำนวน</TableHead><TableHead className="px-5 py-3 text-right">ยอดขาย</TableHead><TableHead className="px-5 py-3">สต็อก</TableHead><TableHead className="px-5 py-3">Settlement</TableHead><TableHead className="px-5 py-3">สถานะ</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredOrders.map((order) => <TableRow
                  key={order.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/tiktok-orders/${encodeURIComponent(order.id)}`)}
                  onKeyDown={(event) => { if (event.key === "Enter") router.push(`/tiktok-orders/${encodeURIComponent(order.id)}`); }}
                  className="cursor-pointer border-b hover:bg-muted/50"
                >
                  <TableCell className="px-5 py-4 align-top"><div className="text-xs" style={{ color: c.ink3 }}>{order.date}</div><Mono t={t} size={12} weight={600}>{order.id}</Mono></TableCell>
                  <TableCell className="px-5 py-4 align-top"><div className="font-medium">{order.product}</div><div className="mt-0.5 font-mono text-[11px]" style={{ color: c.ink3 }}>{order.sku}{order.items && order.items.length > 1 ? ` · ${order.items.length} รายการสินค้า` : ""}</div></TableCell>
                  <TableCell className="px-5 py-4 text-right align-top"><Mono t={t} size={12}>{fmtNum(order.qty)}</Mono></TableCell>
                  <TableCell className="px-5 py-4 text-right align-top"><Mono t={t} size={13} weight={600}>{fmtBaht(order.amount)}</Mono></TableCell>
                  <TableCell className="px-5 py-4 align-top"><Badge variant={order.stockDeducted ? "normal" : "low"}>{order.stockDeducted ? "ตัดแล้ว" : "รอตัด"}</Badge></TableCell>
                  <TableCell className="px-5 py-4 align-top">{order.settled ? <div><div className="text-xs font-semibold" style={{ color: c.pos }}>{fmtBaht(order.netRevenue ?? 0)}</div><div className="text-[10px]" style={{ color: c.ink3 }}>ค่าธรรมเนียม {fmtBaht(order.platformFee ?? 0)}</div></div> : <Badge variant="empty">รอ Settlement</Badge>}</TableCell>
                  <TableCell className="px-5 py-4 align-top"><Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>{STATUS_LABEL[order.status] ?? order.status}</Badge></TableCell>
                </TableRow>)}
                {filteredOrders.length === 0 && <TableRow><TableCell colSpan={7} className="p-10 text-center text-sm" style={{ color: c.ink3 }}>ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, Mono, TopBar, fmtBaht, fmtNum } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default function TikTokOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { tokens: t } = useTheme();
  const c = t.color;
  const orders = useErpStore((state) => state.tiktokOrders);
  const loadResources = useErpStore((state) => state.loadResources);
  const [loading, setLoading] = useState(true);
  const orderId = decodeURIComponent(params.id);
  const order = orders.find((item) => item.id === orderId);

  useEffect(() => {
    loadResources(["tiktokOrders"]).finally(() => setLoading(false));
  }, [loadResources]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm" style={{ background: c.canvas, color: c.ink3 }}>กำลังโหลดคำสั่งซื้อ...</div>;
  }

  if (!order) {
    return <div className="flex min-h-screen items-center justify-center p-6" style={{ background: c.canvas }}>
      <Card t={t} className="max-w-md p-8 text-center">
        <div className="text-lg font-semibold">ไม่พบคำสั่งซื้อ</div>
        <div className="mt-2 text-sm" style={{ color: c.ink3 }}>ไม่พบเลขคำสั่งซื้อ {orderId}</div>
        <Button className="mt-5" variant="outline" onClick={() => router.push("/tiktok-orders")}>กลับหน้ารายการ</Button>
      </Card>
    </div>;
  }

  const orderItems = order.items?.length ? order.items : [{
    id: 0, orderId: order.id, lineItemId: "", productName: order.product,
    sku: order.sku, qty: order.qty,
    unitPrice: order.qty ? order.amount / order.qty : 0, amount: order.amount,
  }];

  return <div className="min-h-screen pb-16" style={{ background: c.canvas }}>
    <TopBar
      t={t}
      breadcrumb={["Chawy", "Channels", "TikTok Orders", order.id]}
      title={`คำสั่งซื้อ ${order.id}`}
      subtitle={`รายละเอียดคำสั่งซื้อวันที่ ${order.date}`}
      right={<Button variant="outline" onClick={() => router.push("/tiktok-orders")}>← กลับหน้ารายการ</Button>}
    />

    <div className="mx-auto grid max-w-6xl gap-6 p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "ยอดคำสั่งซื้อ", value: fmtBaht(order.amount), sub: "ยอดก่อนหักค่าธรรมเนียม" },
          { label: "จำนวนสินค้า", value: fmtNum(order.qty), sub: "ชิ้น" },
          { label: "รายได้สุทธิ", value: order.settled ? fmtBaht(order.netRevenue ?? 0) : "รอ Settlement", sub: order.settled ? `หักค่าธรรมเนียม ${fmtBaht(order.platformFee ?? 0)}` : "ยังไม่มีข้อมูลการชำระเงิน" },
          { label: "สถานะ", value: STATUS_LABEL[order.status] ?? order.status, sub: order.stockDeducted ? "ตัดสต็อกแล้ว" : "ยังไม่ตัดสต็อก" },
        ].map((item) => <Card key={item.label} t={t} className="border border-border bg-card p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.10em]" style={{ color: c.ink3 }}>{item.label}</div>
          <div className="mt-2 text-xl font-semibold">{item.value}</div>
          <div className="mt-1 text-xs" style={{ color: c.ink3 }}>{item.sub}</div>
        </Card>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card t={t} pad={false} className="overflow-hidden border border-border bg-card">
          <div className="border-b p-4 font-semibold">รายการสินค้า</div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50"><TableRow>
                <TableHead className="px-5 py-3">สินค้า</TableHead>
                <TableHead className="px-5 py-3 text-right">จำนวน</TableHead>
                <TableHead className="px-5 py-3 text-right">ราคาต่อหน่วย</TableHead>
                <TableHead className="px-5 py-3 text-right">รวม</TableHead>
              </TableRow></TableHeader>
              <TableBody>{orderItems.map((item) => <TableRow key={item.lineItemId || `${item.sku}-${item.id}`}>
                <TableCell className="px-5 py-5"><div className="font-semibold">{item.productName}</div><Mono t={t} size={11} color={c.ink3}>{item.sku}</Mono></TableCell>
                <TableCell className="px-5 py-5 text-right"><Mono t={t} size={12}>{fmtNum(item.qty)}</Mono></TableCell>
                <TableCell className="px-5 py-5 text-right"><Mono t={t} size={12}>{fmtBaht(item.unitPrice)}</Mono></TableCell>
                <TableCell className="px-5 py-5 text-right"><Mono t={t} size={13} weight={600}>{fmtBaht(item.amount)}</Mono></TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card t={t} className="border border-border bg-card p-5">
            <div className="font-semibold">ข้อมูลคำสั่งซื้อ</div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt style={{ color: c.ink3 }}>เลขคำสั่งซื้อ</dt><dd className="font-mono font-semibold">{order.id}</dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: c.ink3 }}>วันที่สั่งซื้อ</dt><dd>{order.date}</dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: c.ink3 }}>สถานะ</dt><dd><Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>{STATUS_LABEL[order.status] ?? order.status}</Badge></dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: c.ink3 }}>นำเข้าระบบ</dt><dd><Badge variant={order.imported ? "normal" : "low"}>{order.imported ? "นำเข้าแล้ว" : "ยังไม่นำเข้า"}</Badge></dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: c.ink3 }}>การตัดสต็อก</dt><dd><Badge variant={order.stockDeducted ? "normal" : "low"}>{order.stockDeducted ? "ตัดแล้ว" : "รอตัด"}</Badge></dd></div>
            </dl>
          </Card>

          <Card t={t} className="border border-border bg-card p-5">
            <div className="font-semibold">ข้อมูล Settlement</div>
            {order.settled ? <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt style={{ color: c.ink3 }}>ยอดขาย</dt><dd>{fmtBaht(order.amount)}</dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: c.ink3 }}>ค่าธรรมเนียม</dt><dd style={{ color: c.neg }}>- {fmtBaht(order.platformFee ?? 0)}</dd></div>
              <div className="flex justify-between gap-4 border-t pt-3 font-semibold"><dt>รายได้สุทธิ</dt><dd style={{ color: c.pos }}>{fmtBaht(order.netRevenue ?? 0)}</dd></div>
              <div className="border-t pt-3"><dt className="text-xs" style={{ color: c.ink3 }}>Settlement Ref</dt><dd className="mt-1 break-all font-mono text-xs">{order.settlementRef || "-"}</dd></div>
            </dl> : <div className="mt-4 rounded-md border border-dashed p-4 text-sm" style={{ color: c.ink3 }}>คำสั่งซื้อนี้ยังไม่มีข้อมูล Settlement</div>}
          </Card>
        </div>
      </div>
    </div>
  </div>;
}

"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar } from "@/components/ui";
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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import { CreateOrderSheet } from "./components/CreateOrderSheet";
import { ImportOrderSheet } from "./components/ImportOrderSheet";

const STATUS_STYLE: Record<string, { variant: "low" | "secondary" | "normal" | "empty"; label: string }> = {
  Pending: { variant: "low", label: "รอยืนยัน" },
  Confirmed: { variant: "secondary", label: "ยืนยันแล้ว" },
  Completed: { variant: "normal", label: "สำเร็จ" },
  Cancelled: { variant: "empty", label: "ยกเลิก" },
};

const CHANNEL_ICON: Record<string, string> = {
  LINE: "LN",
  Instagram: "IG",
  Facebook: "FB",
  Offline: "OFF",
  Other: "OTH",
};

const CHANNELS = ["LINE", "Instagram", "Facebook", "Offline", "Other"];
const TABS = ["ทั้งหมด", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function ManualOrderPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const list = useErpStore((s) => s.manualOrders);
  const products = useErpStore((s) => s.products);
  const addManualOrder = useErpStore((s) => s.addManualOrder);

  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");

  const filtered = list.filter(
    (o) =>
      (activeTab === "ทั้งหมด" || o.status === activeTab) &&
      (o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search))
  );

  const totalAmount = list.reduce((s, o) => s + o.amount, 0);
  const pendingCount = list.filter((o) => o.status === "Pending").length;
  const confirmedCount = list.filter((o) => o.status === "Confirmed").length;

  function handleCreateOrder(data: {
    customer: string;
    phone: string;
    channel: string;
    amount: number;
    items: number;
    notes: string;
  }) {
    addManualOrder(data);
  }

  function handleImportOrders(rows: any[]) {
    rows.forEach((row) =>
      addManualOrder({
        customer: row.customer || "ไม่ระบุ",
        phone: row.phone || "",
        channel: CHANNELS.includes(row.channel) ? row.channel : "Other",
        amount: parseFloat(row.amount) || 0,
        items: 1,
        notes: row.notes || "",
      })
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Sales", "Manual Orders"]}
        title="Manual Order"
        subtitle="บันทึกออร์เดอร์ช่องทางอื่นๆ"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)} className="cursor-pointer">
              นำเข้าไฟล์
            </Button>
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + สร้างออร์เดอร์
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1320px] mx-auto grid gap-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "ออร์เดอร์ทั้งหมด",
              value: `${list.length} รายการ`,
              sub: formatBaht(totalAmount),
              color: "var(--erp-ink)",
            },
            {
              label: "รอยืนยัน",
              value: `${pendingCount} รายการ`,
              sub: "สถานะ Pending",
              color: "#D97706",
            },
            {
              label: "ยืนยันแล้ว",
              value: `${confirmedCount} รายการ`,
              sub: "สถานะ Confirmed",
              color: "#2563EB",
            },
            {
              label: "ช่องทาง",
              value: `${new Set(list.map((o) => o.channel)).size} ช่อง`,
              sub: CHANNELS.filter((ch) => list.some((o) => o.channel === ch)).join(
                " · "
              ),
              color: "var(--erp-accent)",
            },
          ].map((item) => (
            <Card
              t={t}
              key={item.label}
              className="border border-border bg-card p-5"
              style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                {item.label}
              </div>
              <div
                className="text-2xl font-bold mt-2"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1" style={{ color: "var(--erp-ink3)" }}>
                {item.sub}
              </div>
            </Card>
          ))}
        </div>

        {/* Channel breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {CHANNELS.map((ch) => {
            const count = list.filter((o) => o.channel === ch).length;
            return (
              <Card
                t={t}
                key={ch}
                className="border border-border bg-card p-3 flex items-center gap-3"
                style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
              >
                <span className="text-lg font-bold text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
                  {CHANNEL_ICON[ch]}
                </span>
                <div>
                  <div className="text-xs font-semibold text-foreground" style={{ color: "var(--erp-ink)" }}>
                    {ch}
                  </div>
                  <div className="text-[10px] text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
                    {count} รายการ
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Table */}
        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
          style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
        >
          <div className="p-4 border-b border-border flex items-center gap-4 flex-wrap" style={{ borderColor: "var(--erp-border)" }}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาลูกค้า / เลขที่ / โทรศัพท์..."
              className="max-w-[280px]"
            />
            <div className="flex gap-1.5 flex-wrap">
              {TABS.map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="rounded-full cursor-pointer text-xs h-8 px-4"
                  style={{
                    backgroundColor: activeTab === tab ? "var(--erp-accent)" : undefined,
                    color: activeTab === tab ? "#fff" : undefined,
                  }}
                >
                  {tab}
                </Button>
              ))}
            </div>
            <span className="ml-auto text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
              {filtered.length} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}
              >
                <TableRow>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>เลขที่</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>ลูกค้า</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>โทรศัพท์</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>ช่องทาง</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>วันที่</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>สินค้า</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>มูลค่า</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>สถานะ</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>หมายเหตุ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => {
                  const s = STATUS_STYLE[o.status] || { variant: "outline", label: o.status };
                  return (
                    <TableRow
                      key={o.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                      style={{ borderColor: "var(--erp-border)" }}
                    >
                      <TableCell className="p-4 px-5 align-middle">
                        <Mono t={t} size={12} weight={600} style={{ color: c.accent }}>
                          {o.id}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle font-medium text-foreground" style={{ color: "var(--erp-ink)" }}>
                        {o.customer}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <Mono t={t} size={12} color={c.ink3}>
                          {o.phone}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <Badge variant="outline" className="gap-1 bg-muted/30">
                          {CHANNEL_ICON[o.channel]} {o.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-sm text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
                        {o.date}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-sm text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
                        {o.items} รายการ
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right font-semibold text-foreground" style={{ color: "var(--erp-ink)" }}>
                        {formatBaht(o.amount)}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-xs text-muted-foreground max-w-[160px] truncate" style={{ color: "var(--erp-ink3)" }}>
                        {o.notes || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center p-8 text-sm text-muted-foreground"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <CreateOrderSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        onSubmit={handleCreateOrder}
      />

      <ImportOrderSheet
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportOrders}
      />
    </div>
  );
}

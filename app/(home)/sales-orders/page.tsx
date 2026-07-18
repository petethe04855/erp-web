"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import {
  Btn,
  Card,
  Mono,
  StatusPill,
  TopBar,
  fmtBaht,
  fmtNum,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useErpStore } from "@/lib/store/useErpStore";
import type { SalesOrderStatus } from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";

// Import Sub-Components
import SalesOrderStats from "./components/SalesOrderStats";
import SOActions from "./components/SOActions";
import SalesOrderFormPanel, { Line } from "./components/SalesOrderFormPanel";

const FILTERS: Array<{ key: "all" | SalesOrderStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Processing", label: "Processing" },
  { key: "Completed", label: "Completed" },
  { key: "Cancelled", label: "Cancelled" },
];

const BLANK = {
  customer: "",
  date: new Date().toISOString().split("T")[0],
  channel: "Manual",
  qtRef: "",
  lines: [{ sku: "", qty: 1 }] as Line[],
};

function formatDateShort(date: string) {
  const d = new Date(date);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  if (Number.isNaN(d.getTime())) return date;
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

export default function SalesOrdersPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const salesOrders = useErpStore((state) => state.salesOrders);
  const invoices = useErpStore((state) => state.invoices);
  const products = useErpStore((state) => state.products);
  const createSalesOrder = useErpStore((state) => state.createSalesOrder);
  const createInvoiceFromSO = useErpStore((state) => state.createInvoiceFromSO);
  const updateSalesOrderStatus = useErpStore(
    (state) => state.updateSalesOrderStatus,
  );

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    customer: string;
    date: string;
    channel: string;
    qtRef: string;
    lines: Line[];
  }>(BLANK);
  const [filter, setFilter] = useState<"all" | SalesOrderStatus>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const filtered = salesOrders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;
    if (
      search &&
      !(
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const totalAmount = filtered.reduce((s, order) => s + order.amount, 0);
  const counts = FILTERS.reduce<Record<string, number>>((acc, item) => {
    acc[item.key] =
      item.key === "all"
        ? salesOrders.length
        : salesOrders.filter((order) => order.status === item.key).length;
    return acc;
  }, {});

  const lineTotal = form.lines.reduce((s, line) => {
    const product = products.find((p) => p.sku === line.sku);
    return s + (product ? product.price * Number(line.qty) : 0);
  }, 0);

  const itemsShipped = filtered.reduce((s, order) => s + order.items, 0);
  const largestOrder = Math.max(
    ...(filtered.length ? filtered.map((order) => order.amount) : [0]),
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleSubmit() {
    if (!form.customer) return;
    const hasInvalidLine = form.lines.some(
      (l) => l.qty === "" || Number(l.qty) <= 0,
    );
    if (hasInvalidLine) {
      showToast("กรุณากรอกจำนวนสินค้าให้ถูกต้อง (มากกว่า 0)");
      return;
    }
    const validLines = form.lines
      .filter((line) => line.sku)
      .map((line) => ({ ...line, qty: Number(line.qty) }));
    if (validLines.length === 0) {
      showToast("กรุณาเลือกรายการสินค้าอย่างน้อย 1 รายการ");
      return;
    }
    createSalesOrder({
      customer: form.customer,
      date: form.date,
      amount: lineTotal || 0,
      status: "Pending",
      channel: form.channel as "Manual" | "LINE" | "Shopee" | "TikTok",
      items: validLines.length || 1,
      qtRef: form.qtRef || null,
      lines: validLines,
    });
    setForm(BLANK);
    setOpen(false);
    showToast("สร้าง Sales Order แล้ว");
  }

  function handleCreateInvoice(soId: string) {
    try {
      const inv = createInvoiceFromSO(soId);
      showToast(inv ? `สร้าง ${inv.id} แล้ว` : "สร้าง Invoice ไม่ได้");
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการสร้าง Invoice");
    }
  }

  async function handleExport() {
    try {
      await exportXlsx(
        "sales-orders",
        `sales-orders-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      showToast("Export สำเร็จ");
    } catch (err: any) {
      showToast("Export ล้มเหลว: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Sales", "Orders"]}
        title="Sales Orders"
        subtitle={`${salesOrders.length} orders · ${fmtBaht(salesOrders.reduce((s, order) => s + order.amount, 0))} total`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                {toast}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="cursor-pointer border-border"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
                color: "#374151",
              }}
            >
              Export CSV
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 shadow-none border-none"
            >
              + New Order
            </Button>
          </div>
        }
      />

      <div className="px-8 py-6 max-w-full mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div
            className="flex border border-border rounded-lg overflow-hidden bg-card"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            {FILTERS.map((item, i) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`
                  px-3.5 py-1.5 border-none cursor-pointer text-xs transition-all inline-flex items-center gap-2
                  ${
                    filter === item.key
                      ? "font-bold bg-muted text-foreground"
                      : "font-medium text-muted-foreground hover:bg-muted/30"
                  }
                `}
                style={{
                  borderLeft: i === 0 ? "none" : `1px solid var(--erp-border)`,
                  background:
                    filter === item.key ? "var(--erp-subtle)" : "transparent",
                  color:
                    filter === item.key ? "var(--erp-ink)" : "var(--erp-ink2)",
                }}
              >
                {item.label}
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded transition-all`}
                  style={{
                    color:
                      filter === item.key
                        ? "var(--erp-ink2)"
                        : "var(--erp-ink3)",
                    background:
                      filter === item.key
                        ? "var(--erp-surface)"
                        : "var(--erp-subtle)",
                  }}
                >
                  {counts[item.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา order หรือ ลูกค้า..."
              className="w-60 h-9"
            />
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer border-border"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
                color: "#374151",
              }}
            >
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <SalesOrderStats
          t={t}
          totalAmount={totalAmount}
          filteredCount={filtered.length}
          itemCount={itemsShipped}
          largestAmount={largestOrder}
        />

        <div
          className="bg-card rounded-lg border border-border overflow-hidden"
          style={{
            background: "var(--erp-surface)",
            borderColor: "var(--erp-border)",
          }}
        >
          <Table className="w-full border-collapse">
            <TableHeader
              className="bg-muted/50 border-b border-border"
              style={{
                background: "var(--erp-subtle)",
                borderColor: "var(--erp-border)",
              }}
            >
              <TableRow>
                {[
                  "Order",
                  "Customer",
                  "Channel",
                  "Date",
                  "Items",
                  "Amount",
                  "Status",
                  "Action",
                ].map((h, i) => (
                  <TableHead
                    key={h}
                    className={`p-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${i === 4 || i === 5 || i === 7 ? "text-right" : "text-left"}`}
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order, i) => {
                const hasInv = invoices.some((inv) => inv.soRef === order.id);
                return (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/30 border-b border-border"
                    style={{ borderColor: "var(--erp-subtle)" }}
                  >
                    <TableCell className="p-3">
                      <Mono t={t} size={12} weight={500}>
                        {order.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-3">
                      <div
                        className="text-sm font-semibold text-foreground"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {order.customer}
                      </div>
                    </TableCell>
                    <TableCell className="p-3">
                      <span
                        className="text-xs text-muted-foreground"
                        style={{ color: "var(--erp-ink2)" }}
                      >
                        {order.channel}
                      </span>
                    </TableCell>
                    <TableCell className="p-3">
                      <Mono t={t} size={12} color={c.ink2}>
                        {formatDateShort(order.date)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <Mono t={t} size={12} color={c.ink2}>
                        {order.items}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <Mono t={t} size={13} weight={600}>
                        {fmtBaht(order.amount)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-3">
                      <StatusPill t={t} status={order.status} />
                    </TableCell>
                    <TableCell className="p-3 text-right min-w-[170px]">
                      <SOActions
                        status={order.status}
                        hasInv={hasInv}
                        onStatus={(status) =>
                          updateSalesOrderStatus(order.id, status)
                        }
                        onInvoice={() => handleCreateInvoice(order.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div
              className="p-14 text-center text-muted-foreground text-sm"
              style={{ color: "var(--erp-ink3)" }}
            >
              ไม่พบ order ที่ตรงกับเงื่อนไข
            </div>
          )}
        </div>
      </div>

      <SalesOrderFormPanel
        t={t}
        open={open}
        onClose={() => setOpen(false)}
        form={form}
        setForm={setForm}
        products={products}
        lineTotal={lineTotal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

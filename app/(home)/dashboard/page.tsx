"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import {
  TopBar,
  PageBody,
  Card,
  SectionLabel,
  Mono,
  Dot,
  MetricTile,
  fmtBaht,
  fmtBahtK,
  fmtNum,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";

import { CashFlowChart } from "./components/CashFlowChart";
import { ChannelBar } from "./components/ChannelBar";
import { AlertRow } from "./components/AlertRow";
import { PnlBars } from "./components/PnlBars";

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function getLast6MonthKeys(year: number, month: number): string[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, month - 1 - (5 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function getMonthDays(year: number, month: number): string[] {
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return `${year}-${String(month).padStart(2, "0")}-${day}`;
  });
}

const MONTH_SHORT = [
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
function monthShort(key: string) {
  const m = parseInt(key.slice(5, 7), 10) - 1;
  return MONTH_SHORT[m] ?? key;
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { tokens: t } = useTheme();
  const c = t.color;

  const salesOrders = useErpStore((s) => s.salesOrders);
  const expenses = useErpStore((s) => s.expenses);
  const invoices = useErpStore((s) => s.invoices);
  const products = useErpStore((s) => s.products);
  const purchaseReqs = useErpStore((s) => s.purchaseRequests);
  const purchaseOrders = useErpStore((s) => s.purchaseOrders);
  const stockLots = useErpStore((s) => s.stockLots);
  const currentUser = useErpStore((s) => s.currentUser);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<number>([currentYear]);
    [...salesOrders.map((o) => o.date), ...expenses.map((e) => e.date)]
      .map((date) => Number(date.slice(0, 4)))
      .filter((year) => Number.isFinite(year) && year <= currentYear)
      .forEach((year) => years.add(year));

    const earliestYear = Math.min(...Array.from(years));
    for (let year = earliestYear; year <= currentYear; year++) {
      years.add(year);
    }

    return Array.from(years).sort((a, b) => b - a);
  }, [expenses, salesOrders]);
  const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const periodLabel = new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(new Date(selectedYear, selectedMonth - 1, 1));

  // KPIs
  const periodOrders = salesOrders.filter(
    (o) => o.date.startsWith(periodKey) && o.status !== "Cancelled",
  );
  const monthlyRevenue = periodOrders.reduce((s, o) => s + o.amount, 0);
  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(periodKey))
    .reduce((s, e) => s + e.amount, 0);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const marginPct =
    monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

  // Selected-month daily series
  const periodDays = getMonthDays(selectedYear, selectedMonth);
  const series30 = periodDays.map((date, i) => ({
    d: i + 1,
    rev: salesOrders
      .filter((o) => o.date === date && o.status !== "Cancelled")
      .reduce((s, o) => s + o.amount, 0),
    exp: expenses
      .filter((e) => e.date === date)
      .reduce((s, e) => s + e.amount, 0),
  }));
  const totalRev30 = series30.reduce((s, d) => s + d.rev, 0);
  const totalExp30 = series30.reduce((s, d) => s + d.exp, 0);
  const totalNet30 = totalRev30 - totalExp30;

  // Weekly breakdown
  const weeks = Array.from(
    { length: Math.ceil(series30.length / 7) },
    (_, w) => {
      const slice = series30.slice(w * 7, w * 7 + 7);
      return {
        label: `Week ${w + 1}`,
        rev: slice.reduce((s, d) => s + d.rev, 0),
        exp: slice.reduce((s, d) => s + d.exp, 0),
      };
    },
  );

  // Channels from salesOrders
  const channelTotals: Record<string, number> = {};
  periodOrders.forEach((o) => {
    const ch = o.channel || "Other";
    channelTotals[ch] = (channelTotals[ch] ?? 0) + o.amount;
  });
  const channels = Object.entries(channelTotals)
    .map(([name, rev]) => ({ name, rev, delta: 0 }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 5);
  const maxChan = Math.max(...channels.map((c) => c.rev), 1);

  // Alerts
  const nearExpiryLots = stockLots.filter(
    (l) => l.expiryDate && l.remainingQty > 0 && daysUntil(l.expiryDate) <= 30,
  );
  const latePOs = purchaseOrders.filter(
    (po) =>
      po.status !== "Completed" && po.etaDate && daysUntil(po.etaDate) < 0,
  );
  const overdueInvoices = invoices.filter((inv) => inv.status === "Overdue");
  const pendingPRs = purchaseReqs.filter(
    (pr) => pr.status === "Pending Approval",
  );
  const lowStockItems = products.filter((p) => p.stock === 0 && !p.isBundle);

  type AlertItem = {
    sev: "high" | "med" | "low";
    title: string;
    meta: string;
    age: string;
  };
  const alerts: AlertItem[] = [
    ...lowStockItems
      .slice(0, 2)
      .map((p) => ({
        sev: "high" as const,
        title: `${p.name} หมดสต็อค`,
        meta: `${p.sku} · reorder required`,
        age: "now",
      })),
    ...latePOs
      .slice(0, 2)
      .map((po) => ({
        sev: "high" as const,
        title: `PO ${po.id} เกิน ETA`,
        meta: `${po.supplier} · ${fmtBaht(po.totalCost)}`,
        age: `${Math.abs(daysUntil(po.etaDate!))}d`,
      })),
    ...overdueInvoices
      .slice(0, 2)
      .map((inv) => ({
        sev: "med" as const,
        title: `Invoice ${inv.id} เกินกำหนด`,
        meta: `${fmtBaht(inv.amount)} ค้างชำระ`,
        age: "—",
      })),
    ...nearExpiryLots
      .slice(0, 2)
      .map((lot) => ({
        sev: "med" as const,
        title: `Lot ${lot.lot} ใกล้หมดอายุ`,
        meta: `${lot.sku} · ${lot.remainingQty} ชิ้น · ${daysUntil(lot.expiryDate!)} วัน`,
        age: `${daysUntil(lot.expiryDate!)}d`,
      })),
    ...pendingPRs
      .slice(0, 2)
      .map((pr) => ({
        sev: "low" as const,
        title: `PR ${pr.id} รออนุมัติ`,
        meta: pr.items.length > 0 ? `${pr.items.length} รายการ` : "—",
        age: "—",
      })),
  ].slice(0, 6);

  // 6-month P&L
  const last6 = getLast6MonthKeys(selectedYear, selectedMonth);
  const pnl6 = last6.map((month) => {
    const rev = salesOrders
      .filter((o) => o.date.startsWith(month) && o.status !== "Cancelled")
      .reduce((s, o) => s + o.amount, 0);
    const exp = expenses
      .filter((e) => e.date.startsWith(month))
      .reduce((s, e) => s + e.amount, 0);
    const net = Math.max(rev - exp, 0);
    const mPct = rev > 0 ? (net / rev) * 100 : 0;
    return { month: monthShort(month), rev, net, mPct };
  });

  const latestMargin = pnl6[pnl6.length - 1]?.mPct ?? 0;

  const nowDate = new Date();
  const dateStr = `${MONTH_SHORT[nowDate.getMonth()]} ${nowDate.getDate()}, ${nowDate.getFullYear()}`;

  function handleExport() {
    const csvContent = [
      ["Date", "Day", "Revenue (THB)", "Expenses (THB)", "Net Profit (THB)"],
      ...series30.map((item, i) => [
        periodDays[i],
        item.d,
        item.rev,
        item.exp,
        item.rev - item.exp,
      ]),
    ]
      .map((e) =>
        e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([`\ufeff${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dashboard-cashflow-${periodKey}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-canvas" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Dashboard"]}
        title={`Good morning, ${(currentUser?.name || "Guest").split(" ")[0]}`}
        subtitle={`${dateStr} · ภาพรวมระบบ Chawy ERP`}
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="cursor-pointer border-border" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}>
              Export
            </Button>
            <Link href="/sales-orders">
              <Button size="sm" className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 shadow-none border-none">
                + New Order
              </Button>
            </Link>
          </div>
        }
      />

      <PageBody t={t} maxWidth={1320}>
        <Card t={t} className="mb-4 p-[14px_18px] border border-border bg-card" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <div className="text-xs font-semibold text-foreground" style={{ color: 'var(--erp-ink)' }}>
                ค้นหาข้อมูลตามช่วงเวลา
              </div>
              <div className="text-[11px] text-muted-foreground mt-1" style={{ color: 'var(--erp-ink3)' }}>
                กำลังแสดงข้อมูลเดือน {periodLabel}
              </div>
            </div>
            <div className="grid gap-1">
              <Label className="text-[11px] text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>เดือน</Label>
              <NativeSelect
                value={filterMonth}
                onChange={(e) => setFilterMonth(Number(e.target.value))}
                className="min-w-[140px] cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Intl.DateTimeFormat("th-TH", { month: "long" }).format(
                      new Date(2026, i, 1),
                    )}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-1">
              <Label className="text-[11px] text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>ปี</Label>
              <NativeSelect
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="min-w-[110px] cursor-pointer"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year + 543}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button
              onClick={() => {
                setSelectedMonth(filterMonth);
                setSelectedYear(filterYear);
              }}
              className="bg-[var(--erp-accent)] text-white hover:opacity-90 shadow-none border-none cursor-pointer"
              size="sm"
            >
              Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                setFilterMonth(currentMonth);
                setFilterYear(currentYear);
                setSelectedMonth(currentMonth);
                setSelectedYear(currentYear);
              }}
              className="cursor-pointer border-border"
              style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}
            >
              เดือนปัจจุบัน
            </Button>
          </div>
        </Card>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricTile
            t={t}
            primary
            label="Orders · Selected Month"
            value={fmtNum(periodOrders.length)}
            sub={periodLabel}
          />
          <MetricTile
            t={t}
            label="Revenue · Selected Month"
            value={fmtBaht(monthlyRevenue)}
            delta={null}
            sub={periodKey}
          />
          <MetricTile
            t={t}
            label="Net Profit · Selected Month"
            value={fmtBaht(monthlyProfit)}
            sub={`${marginPct.toFixed(1)}% margin`}
          />
          <MetricTile
            t={t}
            label="Low / Out of Stock"
            value={fmtNum(
              products.filter((p) => p.stock <= p.reorder && !p.isBundle)
                .length,
            )}
            sub={`${products.filter((p) => p.stock === 0 && !p.isBundle).length} out of stock`}
          />
        </div>

        {/* Cash Flow Card */}
        <Card t={t} pad={false} className="mb-6 overflow-hidden border border-border bg-card" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}>
          {/* Header */}
          <div className="p-[22px_24px_18px] flex items-end justify-between border-b border-border" style={{ borderColor: 'var(--erp-border)' }}>
            <div>
              <SectionLabel t={t} className="mb-1">
                Cash Flow · {periodLabel}
              </SectionLabel>
              <div className="text-xs text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                รายรับและรายจ่ายรายวันของเดือนที่เลือก
              </div>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 border-b border-border" style={{ borderColor: 'var(--erp-border)' }}>
            {[
              {
                label: "Revenue · Period",
                value: fmtBaht(totalRev30),
                swatch: c.accent,
                sub: `${periodDays.length} days`,
              },
              {
                label: "Expenses · Period",
                value: fmtBaht(totalExp30),
                swatch: c.expense,
                sub:
                  totalRev30 > 0
                    ? `${((totalExp30 / totalRev30) * 100).toFixed(1)}% of revenue`
                    : "—",
              },
              {
                label: "Net Cash Flow",
                value: fmtBaht(totalNet30),
                swatch: null,
                sub:
                  totalRev30 > 0
                    ? `${((totalNet30 / totalRev30) * 100).toFixed(1)}% margin`
                    : "—",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className="p-[20px_24px_22px] border-r border-border last:border-r-0"
                style={{ borderColor: 'var(--erp-border)' }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  {s.swatch && (
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: s.swatch }}
                    />
                  )}
                  <span className="text-[11px] font-medium tracking-[0.10em] uppercase text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                    {s.label}
                  </span>
                </div>
                <Mono
                  t={t}
                  size={24}
                  weight={600}
                  style={{ display: "block", letterSpacing: "-0.02em" }}
                >
                  {s.value}
                </Mono>
                <div className="text-xs text-muted-foreground mt-2" style={{ color: 'var(--erp-ink3)' }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Legend + Chart */}
          <div className="p-[12px_16px_4px]">
            <div className="flex items-center gap-5 p-[4px_8px_8px_40px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-4 rounded-sm inline-block" style={{ background: c.accent }} />
                <span className="text-xs font-semibold text-foreground" style={{ color: 'var(--erp-ink)' }}>
                  รายรับ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-4 rounded-sm inline-block" style={{ background: c.expense }} />
                <span className="text-xs font-semibold text-foreground" style={{ color: 'var(--erp-ink)' }}>
                  รายจ่าย
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 opacity-50 rounded-sm inline-block" style={{ background: c.ink2 }} />
                <span className="text-[11px] text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                  ค่าเฉลี่ยกำไร 7 วัน
                </span>
              </div>
            </div>
            <CashFlowChart t={t} data={series30} />
          </div>

          {/* Weekly breakdown */}
          <div className="border-t border-border p-[14px_24px] grid grid-cols-4" style={{ borderColor: 'var(--erp-border)' }}>
            {weeks.map((w, i) => (
              <div
                key={w.label}
                className="pr-4 border-r border-border last:border-r-0"
                style={{
                  borderColor: 'var(--erp-border)',
                  paddingLeft: i === 0 ? 0 : '16px',
                }}
              >
                <div className="text-[10px] font-medium tracking-[0.08em] uppercase text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                  {w.label}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <Mono t={t} size={14} weight={600}>
                    {fmtBahtK(w.rev - w.exp)}
                  </Mono>
                  <span className="text-[10px] text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                    net
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Channels + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 mb-6">
          {channels.length > 0 && (
            <Card t={t} className="border border-border bg-card" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}>
              <SectionLabel
                t={t}
                action={
                  <Link
                    href="/sales-orders"
                    className="text-[11px] text-primary font-medium hover:underline"
                    style={{ color: 'var(--erp-accent)' }}
                  >
                    View all →
                  </Link>
                }
              >
                Revenue by Channel · {periodLabel}
              </SectionLabel>
              {channels.map((ch) => (
                <ChannelBar
                  key={ch.name}
                  t={t}
                  name={ch.name}
                  rev={ch.rev}
                  delta={ch.delta}
                  max={maxChan}
                />
              ))}
            </Card>
          )}
          {alerts.length > 0 && (
            <Card t={t} className="border border-border bg-card" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}>
              <SectionLabel
                t={t}
                action={
                  <Mono t={t} size={11} color={c.ink3}>
                    {alerts.length} active
                  </Mono>
                }
              >
                Alerts
              </SectionLabel>
              {alerts.map((a, i) => (
                <AlertRow
                  key={i}
                  t={t}
                  sev={a.sev}
                  title={a.title}
                  meta={a.meta}
                  age={a.age}
                  divider={i > 0}
                />
              ))}
            </Card>
          )}
        </div>

        {/* P&L 6-month */}
        <Card t={t} className="border border-border bg-card" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
            <div>
              <SectionLabel t={t} className="mb-1.5">
                Profit & Loss · 6 Months ending {periodLabel}
              </SectionLabel>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                  Net margin
                </span>
                <Mono t={t} size={20} weight={600} style={{ marginLeft: 10 }}>
                  {latestMargin.toFixed(1)}%
                </Mono>
              </div>
            </div>
            <div className="flex items-center gap-[18px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border border-border inline-block rounded-sm" style={{ background: c.subtle, borderColor: 'var(--erp-border)' }} />
                <span className="text-[11px] text-muted-foreground" style={{ color: 'var(--erp-ink2)' }}>
                  Revenue
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ background: c.accent }} />
                <span className="text-[11px] text-muted-foreground" style={{ color: 'var(--erp-ink2)' }}>
                  Net profit
                </span>
              </div>
              <Link
                href="/pl"
                className="text-[11px] text-primary font-medium hover:underline"
                style={{ color: 'var(--erp-accent)' }}
              >
                Open P&L →
              </Link>
            </div>
          </div>
          <PnlBars t={t} data={pnl6} />
          <div className="grid grid-cols-6 gap-3.5 mt-3.5 pt-3.5 border-t border-border" style={{ borderColor: 'var(--erp-border)' }}>
            {pnl6.map((d) => (
              <div key={d.month} className="text-left">
                <Mono t={t} size={13} weight={600}>
                  {fmtBahtK(d.net)}
                </Mono>
                <div className="text-[10px] text-muted-foreground mt-0.5 font-mono" style={{ color: 'var(--erp-ink3)' }}>
                  {d.mPct.toFixed(1)}% margin
                </div>
              </div>
            ))}
          </div>
        </Card>
      </PageBody>
    </div>
  );
}

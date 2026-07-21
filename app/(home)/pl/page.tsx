"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar, fmtBaht } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useErpStore } from "@/lib/store/useErpStore";
import type { ExpenseCategory, ExpenseChannel } from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";
import { MonthPicker } from "./components/MonthPicker";

const MONTH_NAMES = [
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

function fmtMonth(key: string) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

function prevMonthOf(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

const CHANNELS: Array<ExpenseChannel | "ทั้งหมด"> = [
  "ทั้งหมด",
  "TikTok",
  "Shopee",
  "LINE",
  "Manual",
];
const COGS: ExpenseCategory = "COGS/วัตถุดิบ";
const OPEX: ExpenseCategory[] = [
  "ค่าโฆษณา",
  "ค่าธรรมเนียมแพลตฟอร์ม",
  "ค่าขนส่ง",
  "SG&A",
  "ค่าแรง",
  "อื่นๆ",
];

function deltaPct(cur: number, prev: number) {
  return prev ? ((cur - prev) / prev) * 100 : 0;
}

export default function PLPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const salesOrders = useErpStore((s) => s.salesOrders);
  const expenses = useErpStore((s) => s.expenses);
  const tiktokOrders = useErpStore((s) => s.tiktokOrders);
  const nowKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const [month, setMonth] = useState(nowKey);
  const [channel, setChannel] = useState<ExpenseChannel | "ทั้งหมด">("ทั้งหมด");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const prevMonth = prevMonthOf(month);

  function revenueFor(targetMonth: string) {
    return salesOrders
      .filter(
        (order) =>
          order.date.startsWith(targetMonth) &&
          order.status !== "Cancelled" &&
          (channel === "ทั้งหมด" || order.channel === channel),
      )
      .reduce((sum, order) => {
        if (order.channel === "TikTok") {
          const source = tiktokOrders.find((tto) => tto.id === order.sourceRef);
          if (source?.settled && source.netRevenue !== undefined)
            return sum + source.netRevenue;
        }
        return sum + order.amount;
      }, 0);
  }

  function expenseRowsFor(targetMonth: string) {
    return expenses.filter(
      (expense) =>
        expense.date.startsWith(targetMonth) &&
        (channel === "ทั้งหมด" ||
          expense.channel === channel ||
          expense.channel === "ทั่วไป"),
    );
  }

  function amountFor(targetMonth: string, category: ExpenseCategory) {
    return expenseRowsFor(targetMonth)
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  const revCur = revenueFor(month);
  const revPrev = revenueFor(prevMonth);
  const cogsCur = amountFor(month, COGS);
  const cogsPrev = amountFor(prevMonth, COGS);
  const opexCur = OPEX.reduce((sum, cat) => sum + amountFor(month, cat), 0);
  const opexPrev = OPEX.reduce(
    (sum, cat) => sum + amountFor(prevMonth, cat),
    0,
  );
  const grossCur = revCur - cogsCur;
  const grossPrev = revPrev - cogsPrev;
  const netCur = grossCur - opexCur;
  const netPrev = grossPrev - opexPrev;

  function Row({
    label,
    en,
    cur,
    prev,
    kind = "normal",
    indent = false,
  }: {
    label: string;
    en?: string;
    cur: number;
    prev: number;
    kind?: "normal" | "head" | "cost";
    indent?: boolean;
  }) {
    const delta = deltaPct(cur, prev);
    const isHead = kind === "head";
    const color =
      delta >= 0
        ? kind === "cost"
          ? c.neg
          : c.pos
        : kind === "cost"
          ? c.pos
          : c.neg;
    return (
      <TableRow
        className="border-b border-border"
        style={{
          borderColor: "var(--erp-border)",
          background: isHead ? c.subtle : "transparent",
        }}
      >
        <TableCell
          className="p-3 px-6 align-middle"
          style={{ paddingLeft: indent ? 44 : 24 }}
        >
          <span
            className="text-sm font-medium tracking-tight"
            style={{
              fontWeight: isHead ? 600 : 500,
              color: indent ? "var(--erp-ink2)" : "var(--erp-ink)",
            }}
          >
            {label}
          </span>
          {en && (
            <span className="text-xs ml-2" style={{ color: "var(--erp-ink3)" }}>
              {en}
            </span>
          )}
        </TableCell>
        <TableCell className="p-3 px-6 align-middle text-right">
          <Mono
            t={t}
            size={13}
            weight={isHead ? 600 : 500}
            color={cur < 0 ? c.neg : c.ink}
          >
            {fmtBaht(cur)}
          </Mono>
        </TableCell>
        <TableCell className="p-3 px-6 align-middle text-right">
          <Mono t={t} size={12} color={c.ink3}>
            {fmtBaht(prev)}
          </Mono>
        </TableCell>
        <TableCell className="p-3 px-6 align-middle text-right">
          {prev ? (
            <Mono t={t} size={12} weight={500} color={color}>
              {delta >= 0 ? "+" : "−"}
              {Math.abs(delta).toFixed(1)}%
            </Mono>
          ) : (
            <span style={{ color: c.ink4 }}>—</span>
          )}
        </TableCell>
      </TableRow>
    );
  }

  function TotalRow({
    label,
    cur,
    prev,
    accent = false,
  }: {
    label: string;
    cur: number;
    prev: number;
    accent?: boolean;
  }) {
    const delta = deltaPct(cur, prev);
    return (
      <TableRow
        className="border-b border-border"
        style={{
          borderColor: "var(--erp-border)",
          background: accent ? c.accentBg : c.subtle,
        }}
      >
        <TableCell
          className="p-4 px-6 align-middle border-t"
          style={{ borderColor: "var(--erp-border-strong)" }}
        >
          <span
            className="text-sm font-bold tracking-wider uppercase"
            style={{ color: accent ? c.accent : "var(--erp-ink)" }}
          >
            {label}
          </span>
        </TableCell>
        <TableCell
          className="p-4 px-6 align-middle border-t text-right"
          style={{ borderColor: "var(--erp-border-strong)" }}
        >
          <Mono t={t} size={16} weight={600} color={accent ? c.accent : c.ink}>
            {fmtBaht(cur)}
          </Mono>
        </TableCell>
        <TableCell
          className="p-4 px-6 align-middle border-t text-right"
          style={{ borderColor: "var(--erp-border-strong)" }}
        >
          <Mono t={t} size={13} color={c.ink3}>
            {fmtBaht(prev)}
          </Mono>
        </TableCell>
        <TableCell
          className="p-4 px-6 align-middle border-t text-right"
          style={{ borderColor: "var(--erp-border-strong)" }}
        >
          {prev ? (
            <Mono
              t={t}
              size={13}
              weight={600}
              color={delta >= 0 ? c.pos : c.neg}
            >
              {delta >= 0 ? "+" : "−"}
              {Math.abs(delta).toFixed(1)}%
            </Mono>
          ) : (
            <span style={{ color: c.ink4 }}>—</span>
          )}
        </TableCell>
      </TableRow>
    );
  }

  async function handleExport() {
    try {
      await exportXlsx(
        `pl?month=${month}&channel=${channel}`,
        `pl-report-export-${month}.xlsx`,
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
        breadcrumb={["Chawy", "Finance", "P&L Report"]}
        title="Profit & Loss"
        subtitle={`งบกำไรขาดทุน · ${fmtMonth(month)} เทียบกับ ${fmtMonth(
          prevMonth,
        )}`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 pr-2">
                {toast}
              </span>
            )}
            <Button
              variant="outline"
              onClick={handleExport}
              className="cursor-pointer"
            >
              Export XLSX
            </Button>
            <Button variant="outline" className="cursor-pointer">
              Export PDF
            </Button>
            <MonthPicker month={month} onChange={setMonth} nowKey={nowKey} />
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        <div className="flex items-center gap-1.5 justify-end flex-wrap">
          {CHANNELS.map((item) => (
            <Button
              key={item}
              variant={channel === item ? "default" : "outline"}
              size="sm"
              onClick={() => setChannel(item)}
              className="cursor-pointer"
              style={{
                backgroundColor:
                  channel === item ? "var(--erp-accent)" : undefined,
                color: channel === item ? "#fff" : undefined,
              }}
            >
              {item}
            </Button>
          ))}
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total revenue",
              value: revCur,
              delta: deltaPct(revCur, revPrev),
            },
            {
              label: "Gross profit",
              value: grossCur,
              delta: deltaPct(grossCur, grossPrev),
              sub: `${
                revCur ? ((grossCur / revCur) * 100).toFixed(1) : "0.0"
              }% margin`,
            },
            {
              label: "Operating exp.",
              value: opexCur,
              delta: deltaPct(opexCur, opexPrev),
              cost: true,
            },
            {
              label: "Net profit",
              value: netCur,
              delta: deltaPct(netCur, netPrev),
              primary: true,
              sub: `${
                revCur ? ((netCur / revCur) * 100).toFixed(1) : "0.0"
              }% net margin`,
            },
          ].map((item) => (
            <Card
              t={t}
              key={item.label}
              className="border border-border bg-card p-5"
              style={{
                borderColor: item.primary ? c.accent : "var(--erp-border)",
                background: item.primary ? c.accentBg : "var(--erp-surface)",
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                {item.label}
              </div>
              <span className="block mt-2">
                <Mono
                  t={t}
                  size={24}
                  weight={600}
                  color={item.primary ? c.accent : c.ink}
                >
                  {fmtBaht(item.value)}
                </Mono>
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="inline-block">
                  <Mono
                    t={t}
                    size={11}
                    weight={500}
                    color={
                      item.delta >= 0
                        ? item.cost
                          ? c.neg
                          : c.pos
                        : item.cost
                          ? c.pos
                          : c.neg
                    }
                  >
                    {item.delta >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(item.delta).toFixed(1)}%
                  </Mono>
                </span>
                <span
                  className="text-xs text-muted-foreground"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  {item.sub || `vs ${fmtMonth(prevMonth)}`}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Table Report */}
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
                  borderColor: "var(--erp-border-strong)",
                }}
              >
                <TableRow>
                  <TableHead
                    className="p-3 px-6 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Account
                  </TableHead>
                  <TableHead
                    className="p-3 px-6 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {fmtMonth(month)}
                  </TableHead>
                  <TableHead
                    className="p-3 px-6 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {fmtMonth(prevMonth)}
                  </TableHead>
                  <TableHead
                    className="p-3 px-6 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Change
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Row
                  label="รายได้"
                  en="Revenue"
                  cur={revCur}
                  prev={revPrev}
                  kind="head"
                />
                <Row
                  label="ยอดขายสินค้า"
                  en="Product sales"
                  cur={revCur}
                  prev={revPrev}
                  indent
                />
                <Row
                  label="ต้นทุนขาย"
                  en="Cost of goods sold"
                  cur={cogsCur}
                  prev={cogsPrev}
                  kind="head"
                />
                <Row
                  label="ต้นทุนวัตถุดิบ"
                  en="Raw materials"
                  cur={cogsCur}
                  prev={cogsPrev}
                  kind="cost"
                  indent
                />
                <TotalRow
                  label="กำไรขั้นต้น · Gross profit"
                  cur={grossCur}
                  prev={grossPrev}
                />
                <Row
                  label="ค่าใช้จ่ายดำเนินงาน"
                  en="Operating expenses"
                  cur={opexCur}
                  prev={opexPrev}
                  kind="head"
                />
                {OPEX.map((cat) => (
                  <Row
                    key={cat}
                    label={cat}
                    cur={amountFor(month, cat)}
                    prev={amountFor(prevMonth, cat)}
                    kind="cost"
                    indent
                  />
                ))}
                <TotalRow
                  label="กำไรสุทธิ · Net profit"
                  cur={netCur}
                  prev={netPrev}
                  accent
                />
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

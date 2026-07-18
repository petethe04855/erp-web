"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar, fmtBaht } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useErpStore } from "@/lib/store/useErpStore";
import type {
  ExpenseCategory,
  ExpenseChannel,
  MonthBudget,
} from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";
import { MonthPicker } from "./components/MonthPicker";
import { AdjustBudgetDialog } from "./components/AdjustBudgetDialog";

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

export default function BudgetPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const budgets = useErpStore((s) => s.budgets);
  const expenses = useErpStore((s) => s.expenses);
  const upsertBudget = useErpStore((s) => s.upsertBudget);
  const nowKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const [selectedMonth, setSelectedMonth] = useState(nowKey);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const [year, month] = selectedMonth.split("-").map(Number);
  const monthBudgets = budgets.filter(
    (b) => b.year === year && b.month === month,
  );

  function actualFor(category: ExpenseCategory, channel: ExpenseChannel) {
    return expenses
      .filter(
        (expense) =>
          expense.date.startsWith(selectedMonth) &&
          expense.category === category &&
          expense.channel === channel,
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  const rows = monthBudgets.map((budget) => ({
    ...budget,
    actual: actualFor(budget.category, budget.channel),
  }));
  const totalBudget = rows.reduce((sum, row) => sum + row.budgetAmount, 0);
  const totalActual = rows.reduce((sum, row) => sum + row.actual, 0);
  const usedPct = totalBudget ? (totalActual / totalBudget) * 100 : 0;

  function startEdit(row: MonthBudget) {
    setEditingId(row.id);
    setEditValue(String(row.budgetAmount));
  }

  function saveEdit(row: MonthBudget) {
    const amount = parseFloat(editValue);
    if (amount > 0)
      upsertBudget({
        year: row.year,
        month: row.month,
        category: row.category,
        channel: row.channel,
        budgetAmount: amount,
      });
    setEditingId(null);
  }

  function handleSaveBudget(
    category: ExpenseCategory,
    channel: ExpenseChannel,
    amount: number,
  ) {
    const now = new Date();
    upsertBudget({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      category,
      channel,
      budgetAmount: amount,
    });
  }

  async function handleExport() {
    try {
      await exportXlsx(
        `budget?month=${selectedMonth}`,
        `budget-export-${selectedMonth}.xlsx`,
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
        breadcrumb={["Chawy", "Finance", "Budget"]}
        title="Budget"
        subtitle={`งบประมาณ · ${fmtMonth(selectedMonth)}`}
        right={
          <div className="flex gap-2 items-center">
            {toast && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 pr-2">
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
              Export XLSX
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setAddOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 shadow-none border-none"
            >
              Adjust Budget
            </Button>

            <MonthPicker
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              nowKey={nowKey}
              fmtMonth={fmtMonth}
            />
          </div>
        }
      />

      <div className="px-8 py-6 max-w-full mx-auto">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total budget", value: totalBudget, sub: "allocated" },
            {
              label: "Actual spend",
              value: totalActual,
              sub: `${usedPct.toFixed(1)}% used`,
              tone: usedPct > 100 ? c.neg : c.ink,
            },
            {
              label: "Remaining",
              value: totalBudget - totalActual,
              sub: "available",
              tone: totalBudget - totalActual < 0 ? c.neg : c.pos,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-lg p-[18px_22px]"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              <div
                className="text-[10px] font-medium tracking-[0.10em] uppercase text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                {item.label}
              </div>
              <Mono
                t={t}
                size={24}
                weight={600}
                color={item.tone || c.ink}
                style={{ display: "block", marginTop: 10 }}
              >
                {fmtBaht(item.value)}
              </Mono>
              <div
                className="text-xs text-muted-foreground mt-1.5"
                style={{ color: "var(--erp-ink3)" }}
              >
                {item.sub}
              </div>
            </div>
          ))}
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
                  { label: "Category" },
                  { label: "Channel" },
                  { label: "Budget", right: true },
                  { label: "Actual", right: true },
                  { label: "Usage" },
                  { label: "Variance", right: true },
                ].map((h) => (
                  <TableHead
                    key={h.label}
                    className={`p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider ${h.right ? "text-right" : "text-left"}`}
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {h.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => {
                const pct = row.budgetAmount
                  ? (row.actual / row.budgetAmount) * 100
                  : 0;
                const over = row.actual > row.budgetAmount;
                const variance = row.budgetAmount - row.actual;
                const barColor = over ? c.neg : pct > 90 ? c.warn : c.pos;
                const editing = editingId === row.id;
                return (
                  <TableRow
                    key={row.id}
                    className="border-b border-border"
                    style={{ borderColor: "var(--erp-subtle)" }}
                  >
                    <TableCell className="p-3">
                      <span
                        className="text-sm font-semibold text-foreground"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {row.category}
                      </span>
                    </TableCell>
                    <TableCell className="p-3">
                      <span
                        className="text-xs text-muted-foreground"
                        style={{ color: "var(--erp-ink2)" }}
                      >
                        {row.channel}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      {editing ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(row)}
                          onKeyDown={(e) =>
                            e.key === "Enter" ? saveEdit(row) : null
                          }
                          autoFocus
                          className="w-[120px] text-right inline-block h-8 px-2"
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(row)}
                          className="border-none bg-transparent cursor-pointer p-0 inline-flex justify-end w-full"
                        >
                          <Mono t={t} size={12} color={c.ink2}>
                            {fmtBaht(row.budgetAmount)}
                          </Mono>
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <Mono t={t} size={13} weight={600}>
                        {fmtBaht(row.actual)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        <div
                          className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"
                          style={{ background: "var(--erp-subtle)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: barColor,
                            }}
                          />
                        </div>
                        <Mono
                          t={t}
                          size={11}
                          weight={500}
                          color={barColor}
                          style={{ minWidth: 42, textAlign: "right" }}
                        >
                          {pct.toFixed(0)}%
                        </Mono>
                      </div>
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <Mono
                        t={t}
                        size={12}
                        weight={500}
                        color={variance >= 0 ? c.pos : c.neg}
                      >
                        {variance >= 0 ? "+" : "−"}
                        {fmtBaht(Math.abs(variance))}
                      </Mono>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <div
              className="p-14 text-center text-muted-foreground text-sm"
              style={{ color: "var(--erp-ink3)" }}
            >
              ยังไม่มีงบประมาณสำหรับเดือนนี้
            </div>
          )}
        </Card>
      </div>

      <AdjustBudgetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleSaveBudget}
      />
    </div>
  );
}

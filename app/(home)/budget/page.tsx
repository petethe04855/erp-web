"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Btn, Card, Mono, TopBar, fmtBaht } from "@/components/ui";
import { useErpStore } from "@/lib/store/useErpStore";
import type {
  ExpenseCategory,
  ExpenseChannel,
  MonthBudget,
} from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";

const CATEGORIES: ExpenseCategory[] = [
  "ค่าโฆษณา",
  "ค่าธรรมเนียมแพลตฟอร์ม",
  "COGS/วัตถุดิบ",
  "SG&A",
  "ค่าขนส่ง",
  "ค่าแรง",
  "อื่นๆ",
];
const CHANNELS: ExpenseChannel[] = [
  "TikTok",
  "Shopee",
  "LINE",
  "Manual",
  "ทั่วไป",
];
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

const MONTHS = (() => {
  const year = new Date().getFullYear();
  return Array.from(
    { length: 12 },
    (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`,
  );
})();

function inputStyle(
  t: ReturnType<typeof useTheme>["tokens"],
): React.CSSProperties {
  return {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${t.color.border}`,
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    background: t.color.surface,
    color: t.color.ink,
  };
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
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "ค่าโฆษณา" as ExpenseCategory,
    channel: "TikTok" as ExpenseChannel,
    amount: "",
  });
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

  function addBudget() {
    const amount = parseFloat(newBudget.amount);
    if (!amount || amount <= 0) return;
    const now = new Date();
    upsertBudget({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      category: newBudget.category,
      channel: newBudget.channel,
      budgetAmount: amount,
    });
    setNewBudget({ category: "ค่าโฆษณา", channel: "TikTok", amount: "" });
    setAddOpen(false);
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
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Finance", "Budget"]}
        title="Budget"
        subtitle={`งบประมาณ · ${fmtMonth(selectedMonth)}`}
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {toast && (
              <span style={{ fontSize: 12, color: c.pos, fontWeight: 600 }}>
                {toast}
              </span>
            )}
            <Btn t={t} variant="ghost" onClick={handleExport}>
              Export XLSX
            </Btn>
            <Btn t={t} variant="primary" onClick={() => setAddOpen(true)}>
              Adjust Budget
            </Btn>
            <div style={{ position: "relative" }}>
              <Btn
                t={t}
                variant="ghost"
                onClick={() => {
                  setShowPicker((v) => !v);
                  setPickerYear(parseInt(selectedMonth.split("-")[0]));
                }}
              >
                {fmtMonth(selectedMonth)} ▾
              </Btn>
              {showPicker && (
                <>
                  <div
                    onClick={() => setShowPicker(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 100 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: 6,
                      background: c.surface,
                      border: `1px solid ${c.border}`,
                      borderRadius: t.radius,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      zIndex: 101,
                      padding: 16,
                      width: 240,
                    }}
                  >
                    {/* Year navigation */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                      }}
                    >
                      <button
                        onClick={() => setPickerYear((y) => y - 1)}
                        style={{
                          width: 28,
                          height: 28,
                          border: `1px solid ${c.border}`,
                          borderRadius: 6,
                          background: c.canvas,
                          color: c.ink2,
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ‹
                      </button>
                      <span
                        style={{ fontSize: 14, fontWeight: 700, color: c.ink }}
                      >
                        {pickerYear}
                      </span>
                      <button
                        onClick={() => setPickerYear((y) => y + 1)}
                        disabled={pickerYear >= parseInt(nowKey.split("-")[0])}
                        style={{
                          width: 28,
                          height: 28,
                          border: `1px solid ${c.border}`,
                          borderRadius: 6,
                          background: c.canvas,
                          color:
                            pickerYear >= parseInt(nowKey.split("-")[0])
                              ? c.ink4
                              : c.ink2,
                          cursor:
                            pickerYear >= parseInt(nowKey.split("-")[0])
                              ? "default"
                              : "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ›
                      </button>
                    </div>
                    {/* Month grid 4×3 */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 6,
                      }}
                    >
                      {MONTH_NAMES.map((name, i) => {
                        const key = `${pickerYear}-${String(i + 1).padStart(2, "0")}`;
                        const isCurrent = key === selectedMonth;
                        const isFuture = key > nowKey;
                        return (
                          <button
                            key={key}
                            disabled={isFuture}
                            onClick={() => {
                              setSelectedMonth(key);
                              setShowPicker(false);
                            }}
                            style={{
                              padding: "7px 0",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: isFuture ? "default" : "pointer",
                              fontFamily: t.font.sans,
                              fontWeight: isCurrent ? 700 : 400,
                              background: isCurrent
                                ? c.accent
                                : isFuture
                                  ? "transparent"
                                  : c.canvas,
                              color: isCurrent
                                ? "#fff"
                                : isFuture
                                  ? c.ink4
                                  : c.ink2,
                            }}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <div style={{ padding: "24px 32px 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
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
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: t.radius,
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: c.ink3,
                }}
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
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 6 }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        <Card t={t} pad={false} style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 820,
              borderCollapse: "collapse",
              fontFamily: t.font.sans,
            }}
          >
            <thead>
              <tr>
                {[
                  { label: "Category" },
                  { label: "Channel" },
                  { label: "Budget", right: true },
                  { label: "Actual", right: true },
                  { label: "Usage" },
                  { label: "Variance", right: true },
                ].map((h) => (
                  <th
                    key={h.label}
                    style={{
                      textAlign: h.right ? "right" : "left",
                      padding: "11px 24px",
                      fontSize: 10,
                      fontWeight: 500,
                      color: c.ink3,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      borderBottom: `1px solid ${c.border}`,
                      background: c.canvas,
                    }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const pct = row.budgetAmount
                  ? (row.actual / row.budgetAmount) * 100
                  : 0;
                const over = row.actual > row.budgetAmount;
                const variance = row.budgetAmount - row.actual;
                const barColor = over ? c.neg : pct > 90 ? c.warn : c.pos;
                const editing = editingId === row.id;
                return (
                  <tr key={row.id}>
                    <td
                      style={{
                        padding: "14px 24px",
                        borderBottom:
                          i < rows.length - 1
                            ? `1px solid ${c.border}`
                            : "none",
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 500, color: c.ink }}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        borderBottom:
                          i < rows.length - 1
                            ? `1px solid ${c.border}`
                            : "none",
                      }}
                    >
                      <span style={{ fontSize: 12, color: c.ink2 }}>
                        {row.channel}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        borderBottom:
                          i < rows.length - 1
                            ? `1px solid ${c.border}`
                            : "none",
                        textAlign: "right",
                      }}
                    >
                      {editing ? (
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(row)}
                          onKeyDown={(e) =>
                            e.key === "Enter" ? saveEdit(row) : null
                          }
                          autoFocus
                          style={{
                            ...inputStyle(t),
                            width: 120,
                            textAlign: "right",
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(row)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <Mono t={t} size={12} color={c.ink2}>
                            {fmtBaht(row.budgetAmount)}
                          </Mono>
                        </button>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        borderBottom:
                          i < rows.length - 1
                            ? `1px solid ${c.border}`
                            : "none",
                        textAlign: "right",
                      }}
                    >
                      <Mono t={t} size={13} weight={600}>
                        {fmtBaht(row.actual)}
                      </Mono>
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        borderBottom:
                          i < rows.length - 1
                            ? `1px solid ${c.border}`
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 160,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            background: c.subtle,
                            borderRadius: 999,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              height: "100%",
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
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        borderBottom:
                          i < rows.length - 1
                            ? `1px solid ${c.border}`
                            : "none",
                        textAlign: "right",
                      }}
                    >
                      <Mono
                        t={t}
                        size={12}
                        weight={500}
                        color={variance >= 0 ? c.pos : c.neg}
                      >
                        {variance >= 0 ? "+" : "−"}
                        {fmtBaht(Math.abs(variance))}
                      </Mono>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: c.ink3,
                fontSize: 13,
              }}
            >
              ยังไม่มีงบประมาณสำหรับเดือนนี้
            </div>
          )}
        </Card>
      </div>

      {addOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            background: "rgba(0,0,0,0.20)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: 380,
              background: c.surface,
              minHeight: "100%",
              padding: 24,
              boxShadow: "-8px 0 24px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20, color: c.ink }}>
              Adjust Budget
            </h2>
            <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  color: c.ink2,
                  fontWeight: 600,
                }}
              >
                Category
                <select
                  value={newBudget.category}
                  onChange={(e) =>
                    setNewBudget((b) => ({
                      ...b,
                      category: e.target.value as ExpenseCategory,
                    }))
                  }
                  style={inputStyle(t)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  color: c.ink2,
                  fontWeight: 600,
                }}
              >
                Channel
                <select
                  value={newBudget.channel}
                  onChange={(e) =>
                    setNewBudget((b) => ({
                      ...b,
                      channel: e.target.value as ExpenseChannel,
                    }))
                  }
                  style={inputStyle(t)}
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch}>{ch}</option>
                  ))}
                </select>
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  color: c.ink2,
                  fontWeight: 600,
                }}
              >
                Amount
                <input
                  value={newBudget.amount}
                  onChange={(e) =>
                    setNewBudget((b) => ({ ...b, amount: e.target.value }))
                  }
                  type="number"
                  style={inputStyle(t)}
                />
              </label>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <Btn t={t} variant="ghost" onClick={() => setAddOpen(false)}>
                  Close
                </Btn>
                <Btn t={t} variant="primary" onClick={addBudget}>
                  Save
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

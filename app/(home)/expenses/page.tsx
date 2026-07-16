"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar, fmtBaht } from "@/components/ui";
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
import { useErpStore } from "@/lib/store/useErpStore";
import type { ExpenseCategory, ExpenseChannel } from "@/lib/store/erpWorkflow";
import { exportXlsx } from "@/lib/utils/exportUtil";
import { RecordExpenseSheet } from "./components/RecordExpenseSheet";

const CATEGORIES: ExpenseCategory[] = [
  "ค่าโฆษณา",
  "ค่าธรรมเนียมแพลตฟอร์ม",
  "COGS/วัตถุดิบ",
  "SG&A",
  "ค่าขนส่ง",
  "ค่าแรง",
  "อื่นๆ",
];

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

export default function ExpensesPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const expenses = useErpStore((s) => s.expenses);
  const createExpense = useErpStore((s) => s.createExpense);
  const updateExpense = useErpStore((s) => s.updateExpense);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pending = expenses
    .filter(
      (expense) =>
        !expense.invoiceRef ||
        expense.description.toLowerCase().includes("pending")
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  const byCat = CATEGORIES.map((category) => ({
    category,
    amount: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const maxCat = Math.max(...byCat.map((item) => item.amount), 1);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleRecordExpense(form: {
    date: string;
    category: ExpenseCategory;
    channel: ExpenseChannel;
    amount: number;
    description: string;
    vendor: string;
    invoiceRef: string;
  }) {
    createExpense(form);
    showToast(`บันทึกค่าใช้จ่าย ${fmtBaht(form.amount)} แล้ว`);
  }

  async function handleExport() {
    try {
      await exportXlsx(
        "expenses",
        `expenses-export-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      showToast("Export สำเร็จ");
    } catch (err: any) {
      showToast("Export ล้มเหลว: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Finance", "Expenses"]}
        title="Expenses"
        subtitle={`ค่าใช้จ่าย · ${expenses.length} รายการ · ${fmtBaht(total)} เดือนนี้`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 pr-2">
                {toast}
              </span>
            )}
            <Button variant="outline" onClick={handleExport} className="cursor-pointer">
              Export
            </Button>
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + Record Expense
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1320px] mx-auto grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-stretch">
          <Card t={t} pad={false} className="border border-border bg-card" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}>
            <div className="grid grid-rows-2 h-full">
              <div className="p-5 border-b border-border" style={{ borderColor: 'var(--erp-border)' }}>
                <div className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                  Total · MTD
                </div>
                <span className="block mt-2">
                  <Mono t={t} size={24} weight={600}>
                    {fmtBaht(total)}
                  </Mono>
                </span>
              </div>
              <div className="p-5">
                <div className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                  Unpaid
                </div>
                <span className="block mt-2">
                  <Mono t={t} size={24} weight={600} color={c.warn}>
                    {fmtBaht(pending)}
                  </Mono>
                </span>
              </div>
            </div>
          </Card>

          <Card t={t} className="border border-border bg-card p-5" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}>
            <div className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground mb-4" style={{ color: 'var(--erp-ink3)' }}>
              By Category · MTD
            </div>
            <div className="grid gap-3">
              {byCat.slice(0, 5).map((item) => (
                <div
                  key={item.category}
                  className="grid grid-cols-[140px_1fr_100px] items-center gap-4"
                >
                  <span className="text-sm font-medium text-foreground" style={{ color: 'var(--erp-ink)' }}>
                    {item.category}
                  </span>
                  <div className="h-2 bg-muted rounded-full overflow-hidden" style={{ background: 'var(--erp-subtle)' }}>
                    <div
                      className="h-full rounded-full bg-[var(--erp-expense)]"
                      style={{
                        width: `${(item.amount / maxCat) * 100}%`,
                        background: c.expense,
                      }}
                    />
                  </div>
                  <span className="text-right">
                    <Mono t={t} size={12} weight={500}>
                      {fmtBaht(item.amount)}
                    </Mono>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
          style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }}
        >
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/50 border-b border-border" style={{ background: 'var(--erp-subtle)', borderColor: 'var(--erp-border)' }}>
                <TableRow>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: 'var(--erp-ink3)' }}>Ref</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: 'var(--erp-ink3)' }}>Date</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: 'var(--erp-ink3)' }}>Vendor</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: 'var(--erp-ink3)' }}>Category</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: 'var(--erp-ink3)' }}>Method</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: 'var(--erp-ink3)' }}>Amount</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: 'var(--erp-ink3)' }}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="hover:bg-muted/50 transition-colors border-b border-border"
                    style={{ borderColor: 'var(--erp-border)' }}
                  >
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} weight={500}>
                        {expense.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {formatDateShort(expense.date)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle font-medium text-foreground" style={{ color: 'var(--erp-ink)' }}>
                      {expense.vendor}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-sm text-muted-foreground" style={{ color: 'var(--erp-ink2)' }}>
                      {expense.category}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-sm text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>
                      {expense.channel}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={13} weight={600}>
                        {fmtBaht(expense.amount)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <div className="flex items-center gap-3">
                        <Badge variant={expense.invoiceRef ? "normal" : "low"}>
                          {expense.invoiceRef ? "Paid" : "Pending"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const nextInvoiceRef = expense.invoiceRef ? "" : "PAID";
                            await updateExpense(expense.id, { invoiceRef: nextInvoiceRef });
                            showToast(
                              `เปลี่ยนสถานะเป็น ${
                                nextInvoiceRef ? "Paid" : "Pending"
                              } แล้ว`
                            );
                          }}
                          className="h-7 px-2 text-xs cursor-pointer"
                        >
                          {expense.invoiceRef ? "Mark Pending" : "Mark Paid"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <RecordExpenseSheet
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleRecordExpense}
      />
    </div>
  );
}

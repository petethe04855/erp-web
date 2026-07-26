"use client";

import { useState } from "react";
import {
  formatBaht,
  type LeadSource,
  type QuotationStatus,
} from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, StatusPill, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { NewQuotationSheet } from "./components/NewQuotationSheet";

type Line = { sku: string; qty: number };

function quoteStatus(status: QuotationStatus) {
  if (status === "Approved" || status === "Converted") return "completed";
  if (status === "Rejected" || status === "Expired") return "cancelled";
  if (status === "Sent") return "sent";
  return "draft";
}

export default function QuotationPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const list = useErpStore((state) => state.quotations);
  const products = useErpStore((state) => state.products);
  const createQuotation = useErpStore((state) => state.createQuotation);
  const convertQuotationToSalesOrder = useErpStore(
    (state) => state.convertQuotationToSalesOrder,
  );
  const updateQuotationStatus = useErpStore(
    (state) => state.updateQuotationStatus,
  );

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const total = list.reduce((s, q) => s + q.amount, 0);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  function handleCreateQuotation(data: {
    customer: string;
    validUntil: string;
    leadSource: LeadSource;
    lines: Line[];
  }) {
    const newQt = createQuotation(data);
    showToast(`สร้าง ${newQt.id} แล้ว`);
  }

  function transition(id: number | string, status: QuotationStatus, note: string) {
    const updated = updateQuotationStatus(id, status, note);
    if (updated) showToast(`${updated.code || id} → ${status}`);
  }

  function convertToSO(id: number | string) {
    const salesOrder = convertQuotationToSalesOrder(id);
    if (salesOrder) showToast(`${id} → ${salesOrder.code || salesOrder.id} แล้ว`);
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Sales", "Quotations"]}
        title="Quotations"
        subtitle={`ใบเสนอราคา · ${list.length} รายการ · ${formatBaht(total)} pipeline`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{
                  color: toast.includes("กรุณา") ? c.neg : c.pos,
                }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + New Quotation
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* Quotations Table */}
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
                  borderColor: "var(--erp-border)",
                }}
              >
                <TableRow>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Quote
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Customer
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Issued
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Valid until
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Amount
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((q) => (
                  <TableRow
                    key={q.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <TableCell className="p-4 px-5 align-middle">
                      <div className="flex flex-col gap-2">
                        <Mono t={t} size={12} weight={500}>
                          {q.code || q.id}
                        </Mono>
                        <div className="flex gap-1.5 flex-wrap">
                          {q.status === "Draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                transition(
                                  q.id,
                                  "Sent",
                                  "ส่งให้ลูกค้าแล้ว รออนุมัติ",
                                )
                              }
                              className="h-6 text-[10px] px-2 cursor-pointer"
                            >
                              Send
                            </Button>
                          )}
                          {q.status === "Sent" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                transition(
                                  q.id,
                                  "Approved",
                                  "Admin/Owner อนุมัติใบเสนอราคา",
                                )
                              }
                              className="h-6 text-[10px] px-2 cursor-pointer bg-[var(--erp-accent)] text-white border-none"
                            >
                              Approve
                            </Button>
                          )}
                          {q.status === "Approved" && !q.soRef && (
                            <Button
                              size="sm"
                              onClick={() => convertToSO(q.id)}
                              className="h-6 text-[10px] px-2 cursor-pointer bg-[var(--erp-accent)] text-white border-none"
                            >
                              Create SO
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {q.customer}
                      </span>
                      <div
                        className="text-xs mt-1"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        {q.leadSource} · {q.items} items
                      </div>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {q.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {q.validUntil}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={13} weight={600}>
                        {formatBaht(q.amount)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <StatusPill t={t} status={quoteStatus(q.status)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <NewQuotationSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        onSubmit={handleCreateQuotation}
        showToast={showToast}
      />
    </div>
  );
}

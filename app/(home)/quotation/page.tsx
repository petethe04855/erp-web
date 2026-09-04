"use client";

import { useState, useEffect, useMemo } from "react";
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
import { QuotationPrintTemplate } from "./components/QuotationPrintTemplate";

type Line = { sku: string; qty: number; price: number };

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
  const customers = useErpStore((state) => state.customers);
  const rawProducts = useErpStore((state) => state.products);
  const bundleComponents = useErpStore((state) => state.bundleComponents);
  const calcBundleVirtualStock = useErpStore(
    (state) => state.calcBundleVirtualStock,
  );
  const loadResources = useErpStore((state) => state.loadResources);
  const createQuotation = useErpStore((state) => state.createQuotation);
  const convertQuotationToSalesOrder = useErpStore(
    (state) => state.convertQuotationToSalesOrder,
  );
  const updateQuotationStatus = useErpStore(
    (state) => state.updateQuotationStatus,
  );
  const settings = useErpStore((state) => state.settings);
  const currentUser = useErpStore((state) => state.currentUser);

  // Sync products, bundleComponents, quotations, and customers directly with backend data
  useEffect(() => {
    loadResources(["quotations", "products", "bundleComponents", "customers"], true);
  }, [loadResources]);

  // Map products using the exact same available stock logic as SKU Master (stock - reservedQty, or bundle virtual stock)
  const products = useMemo(() => {
    return rawProducts
      .filter((p) => p.isActive !== false)
      .map((p) => {
        const availableStock = p.isBundle
          ? calcBundleVirtualStock(p.sku)
          : Math.max(0, p.stock - (p.reservedQty || 0));

        return {
          sku: p.sku,
          name: p.name,
          price: p.price || p.retailPrice || 0,
          stock: availableStock,
          physicalStock: p.stock,
          reservedQty: p.reservedQty || 0,
          isBundle: Boolean(p.isBundle),
        };
      });
  }, [rawProducts, bundleComponents, calcBundleVirtualStock]);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedId, setSelectedId] = useState<number | string>("");
  const selected =
    list.find((quotation) => String(quotation.id) === String(selectedId)) ??
    list[0];

  const documentLines = useMemo(
    () =>
      selected?.lines.map((line, index) => {
        const product = rawProducts.find((item) => item.sku === line.sku);
        const unitPrice =
          line.price ?? product?.price ?? product?.retailPrice ?? 0;
        return {
          key: `${line.sku}-${index}`,
          sku: line.sku,
          lot: "",
          name: product?.name ?? line.sku,
          qty: line.qty,
          unit: "ชิ้น",
          unitPrice,
          discount: 0,
          total: line.qty * unitPrice,
        };
      }) ?? [],
    [rawProducts, selected],
  );

  const total = list.reduce((s, q) => s + q.amount, 0);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  function handleCreateQuotation(data: {
    customer: string;
    customerAddress: string;
    validUntil: string;
    leadSource: LeadSource;
    lines: Line[];
  }) {
    const newQt = createQuotation(data);
    setSelectedId(newQt.id);
    showToast(`สร้าง ${newQt.id} แล้ว`);
  }

  function transition(
    id: number | string,
    status: QuotationStatus,
    note: string,
  ) {
    const updated = updateQuotationStatus(id, status, note);
    if (updated) showToast(`${updated.code || id} → ${status}`);
  }

  async function convertToSO(id: number | string) {
    try {
      const salesOrder = await convertQuotationToSalesOrder(id);
      if (salesOrder)
        showToast(`${id} → ${salesOrder.code || salesOrder.id} แล้ว`);
    } catch (err: any) {
      showToast(err?.message || "เกิดข้อผิดพลาดในการแปลงเป็น Sales Order");
    }
  }

  async function exportQuotationPdf(quotation = selected) {
    if (!quotation) return;
    try {
      setSelectedId(quotation.id);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      showToast("กำลังเตรียมไฟล์ PDF...");
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById(`quotation-form-${quotation.id}`);
      if (!element) throw new Error("ไม่พบแบบฟอร์มใบเสนอราคา");
      await html2pdf()
        .set({
          margin: 0,
          filename: `${quotation.code || quotation.id}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
      showToast("ดาวน์โหลด PDF แล้ว");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "ดาวน์โหลด PDF ไม่สำเร็จ",
      );
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <div className="no-print">
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
                variant="outline"
                disabled={!selected}
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                variant="outline"
                disabled={!selected}
                onClick={() => exportQuotationPdf()}
              >
                Export PDF
              </Button>
              <Button
                onClick={() => setOpen(true)}
                className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
              >
                + New Quotation
              </Button>
            </div>
          }
        />
      </div>

      <div className="no-print p-6 md:p-8 max-w-full mx-auto grid gap-6">
        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
        >
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left">
                    Quote
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left">
                    Customer
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left">
                    Issued
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left">
                    Valid until
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right">
                    Amount
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left">
                    Status
                  </TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="p-8 text-center text-sm text-muted-foreground"
                    >
                      ไม่พบรายการใบเสนอราคา
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((q) => (
                    <TableRow
                      key={q.id}
                      onClick={() => setSelectedId(q.id)}
                      className="cursor-pointer border-b border-border hover:bg-muted/50 transition-colors"
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
                        <span className="text-sm font-medium text-foreground">
                          {q.customer}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {q.leadSource && <span>{q.leadSource}</span>}
                          {q.leadSource && <span>·</span>}
                          <span>{q.items} items</span>
                        </div>
                        {q.customerAddress && (
                          <div className="text-xs mt-1 max-w-xs text-muted-foreground">
                            {q.customerAddress}
                          </div>
                        )}
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
                      <TableCell className="p-4 px-5 text-right align-middle">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            void exportQuotationPdf(q);
                          }}
                        >
                          ออกใบเสนอราคา
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {selected && (
        <div className="document-export-template">
          <QuotationPrintTemplate
            quotation={selected}
            company={settings.company}
            lines={documentLines}
            seller={currentUser.name}
          />
        </div>
      )}

      <NewQuotationSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        customers={customers}
        onSubmit={handleCreateQuotation}
      />
    </div>
  );
}

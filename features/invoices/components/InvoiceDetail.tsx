"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Receipt,
  AlertCircle,
  Printer,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvoiceDetailQuery } from "../queries/invoiceQueries";
import { money, thaiDate } from "@/features/orders/types/order";
import { useVatRate, splitVatInclusive } from "@/features/settings/hooks/useVatRate";
import { getImageUrl } from "@/lib/utils";
import { DocumentActions } from "@/components/common/DocumentActions";
import { InvoicePrintTemplate } from "./print/InvoicePrintTemplate";
import { exportDocumentPdf } from "@/lib/exportDocumentPdf";
import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/features/settings/api/settingsApi";

interface InvoiceDetailProps {
  invoiceId: string | number;
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const router = useRouter();
  const { data: invoice, isLoading, isError, error, refetch } = useInvoiceDetailQuery(invoiceId);
  const { vatRate } = useVatRate();
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
    staleTime: 5 * 60 * 1000,
  });
  const [showPrintModal, setShowPrintModal] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      setIsExporting(true);
      const el = document.getElementById(`invoice-print-${invoice.id}`);
      if (!el) {
        setShowPrintModal(true);
        setTimeout(async () => {
          const target = document.getElementById(`invoice-print-${invoice.id}`);
          if (target) {
            await exportDocumentPdf(target, `Invoice-${invoice.invoiceNo || invoice.code}.pdf`);
          }
          setIsExporting(false);
        }, 300);
        return;
      }
      await exportDocumentPdf(el, `Invoice-${invoice.invoiceNo || invoice.code}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground text-sm space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>กำลังโหลดข้อมูลใบแจ้งหนี้...</p>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
        <p className="text-destructive font-medium">
          {error instanceof Error ? error.message : "ไม่พบข้อมูลใบแจ้งหนี้ หรือเกิดข้อผิดพลาดในการโหลด"}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ย้อนกลับ
          </Button>
          <Button size="sm" onClick={() => refetch()}>
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  // Payment amounts (only what backend returned)
  const totalAmount = Number(invoice.totalAmount ?? invoice.amount ?? 0);
  const paidAmount = Number(invoice.paid ?? 0);
  const balanceAmount = invoice.balance !== undefined ? Number(invoice.balance) : Math.max(0, totalAmount - paidAmount);

  // Calculate Overdue on-read
  let isOverdue = invoice.isOverdue;
  let dueDaysText = "";
  if (invoice.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(invoice.dueDate);
    dueDateObj.setHours(0, 0, 0, 0);

    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      if (isOverdue === undefined && balanceAmount > 0) {
        isOverdue = true;
      }
      dueDaysText = `เกินกำหนดชำระ (${Math.abs(diffDays)} วัน)`;
    } else if (diffDays === 0) {
      dueDaysText = "ครบกำหนดวันนี้";
    } else {
      dueDaysText = `ครบกำหนดใน ${diffDays} วัน`;
    }
  }

  // Calculate VAT breakdown
  const split = splitVatInclusive(totalAmount, vatRate);
  const subtotal = split.beforeVat;
  const vatAmount = split.vat;

  // Status badge colors
  const getStatusBadge = (status: string, overdue?: boolean) => {
    if (overdue) {
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800";
    }
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "completed") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    }
    if (s === "partial") {
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    }
    return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  };

  return (
    <div className="space-y-6">
      {/* Top navigation & action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/invoices")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            กลับไปรายการ
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <span>ใบแจ้งหนี้ {invoice.invoiceNo || invoice.code}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                invoice.status,
                isOverdue
              )}`}
            >
              {isOverdue ? "Overdue (เกินกำหนดชำระ)" : invoice.status}
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(invoice.soRef || invoice.orderNo) && (
            <Link
              href={
                invoice.orderId
                  ? `/orders/${invoice.orderId}`
                  : `/orders?search=${encodeURIComponent(invoice.soRef || invoice.orderNo || "")}`
              }
            >
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                ใบสั่งขาย: {invoice.soRef || invoice.orderNo}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => setShowPrintModal(true)}
          >
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
            พิมพ์เอกสาร
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={handleDownloadPdf}
            disabled={isExporting}
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            {isExporting ? "กำลังส่งออก..." : "ดาวน์โหลด PDF"}
          </Button>

          <DocumentActions
            type="invoice"
            id={invoice.id}
            code={invoice.invoiceNo || invoice.code}
            status={invoice.status}
            amount={totalAmount}
            balance={balanceAmount}
            onSuccess={() => refetch()}
          />
        </div>
      </div>

      {/* Main Grid: Info + Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Document Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border/60 pb-3">
              <Building2 className="h-4 w-4 text-primary" />
              ข้อมูลลูกค้าและใบแจ้งหนี้
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">ชื่อลูกค้า / บริษัท</span>
                <div className="flex items-center gap-3">
                  {invoice.customerLogo && (
                    <img
                      src={getImageUrl(invoice.customerLogo)}
                      alt={invoice.customerName || invoice.customer}
                      className="h-9 w-9 rounded-md object-contain border border-border bg-muted/40 p-0.5"
                    />
                  )}
                  <p className="font-medium text-foreground">{invoice.customerName || invoice.customer || "—"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">เลขผู้เสียภาษี / สาขา</span>
                <p className="font-medium text-foreground">
                  {invoice.customerTaxId ? (
                    <>
                      {invoice.customerTaxId}
                      {invoice.customerBranch ? ` (${invoice.customerBranch})` : ""}
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              {invoice.customerAddress && (
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> ที่อยู่
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                    {invoice.customerAddress}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> วันที่ออกเอกสาร
                </span>
                <p className="font-medium text-foreground">{thaiDate(invoice.issueDate || invoice.date)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> วันครบกำหนดชำระ (Due Date)
                </span>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{thaiDate(invoice.dueDate || "")}</p>
                  {dueDaysText && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        isOverdue
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {dueDaysText}
                    </span>
                  )}
                </div>
              </div>

              {invoice.paymentMethod && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">วิธีชำระเงิน</span>
                  <p className="font-medium text-foreground">{invoice.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card (Payment & Totals) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border/60 pb-3">
              <FileText className="h-4 w-4 text-primary" />
              สรุปยอดและการชำระ
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>มูลค่าก่อนภาษี</span>
                <span className="font-medium text-foreground">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ภาษีมูลค่าเพิ่ม VAT {vatRate}%</span>
                <span className="font-medium text-foreground">{money(vatAmount)}</span>
              </div>
              <div className="h-px bg-border/60 my-2" />
              <div className="flex justify-between text-sm font-semibold text-foreground">
                <span>ยอดรวมทั้งสิ้น</span>
                <span className="font-bold">{money(totalAmount)}</span>
              </div>

              <div className="pt-2 border-t border-dashed border-border space-y-2">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>ชำระแล้ว</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{money(paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className={balanceAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}>
                    ยอดคงค้างชำระ
                  </span>
                  <span className={balanceAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}>
                    {money(balanceAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
            <Package className="h-4 w-4 text-primary" />
            รายการสินค้า ({invoice.lines?.length || 0} รายการ)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground font-medium text-xs border-b border-border/60">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">รหัส SKU</th>
                <th className="py-3 px-4">ชื่อสินค้า</th>
                <th className="py-3 px-4 text-center">หน่วย</th>
                <th className="py-3 px-4 text-right">จำนวน</th>
                <th className="py-3 px-4 text-right">ราคา/หน่วย</th>
                {invoice.lines?.some((l) => (l.discount || 0) > 0) && (
                  <th className="py-3 px-4 text-right">ส่วนลด</th>
                )}
                <th className="py-3 px-4 text-right">รวมเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {!invoice.lines || invoice.lines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                    ไม่มีรายการสินค้า
                  </td>
                </tr>
              ) : (
                invoice.lines.map((line, idx) => {
                  const qty = line.qty ?? line.quantity ?? 0;
                  const price = line.unitPrice ?? line.price ?? 0;
                  const discount = line.discount ?? 0;
                  const total = line.subtotal ?? line.lineTotal ?? qty * price - discount;

                  return (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-xs font-medium text-foreground">{line.sku || "—"}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{line.name || "—"}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">{line.unit || "ชิ้น"}</td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">{qty.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{money(price)}</td>
                      {invoice.lines?.some((l) => (l.discount || 0) > 0) && (
                        <td className="py-3 px-4 text-right text-rose-500 text-xs">
                          {discount > 0 ? `-${money(discount)}` : "—"}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right font-semibold text-foreground">{money(total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail / Timeline (Rendered only if provided by API) */}
      {invoice.auditTrail && invoice.auditTrail.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border/60 pb-3">
            <Clock className="h-4 w-4 text-primary" />
            ประวัติการทำรายการ (Timeline / Audit Trail)
          </h3>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {invoice.auditTrail.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-3 text-xs">
                <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">{item.action}</p>
                  <p className="text-muted-foreground">
                    โดย {item.actor} · {thaiDate(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Print Preview & Export Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[95vh] w-full max-w-4xl flex-col rounded-xl bg-card shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">ตัวอย่างพิมพ์ใบแจ้งหนี้</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                >
                  <Download className="h-3.5 w-3.5" />
                  {isExporting ? "กำลังส่งออก..." : "บันทึกเป็น PDF"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  สั่งพิมพ์
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPrintModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-neutral-100 flex justify-center">
              <InvoicePrintTemplate
                invoice={invoice}
                company={settingsData?.company}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

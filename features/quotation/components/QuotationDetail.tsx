"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Tag,
  AlertCircle,
  Printer,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotationDetailQuery } from "../queries/quotationQueries";
import { money, thaiDate } from "@/features/orders/types/order";
import { useVatRate, splitVatInclusive } from "@/features/settings/hooks/useVatRate";
import { getImageUrl } from "@/lib/utils";
import { DocumentActions } from "@/components/common/DocumentActions";
import { QuotationPrintTemplate } from "./print/QuotationPrintTemplate";
import { exportDocumentPdf } from "@/lib/exportDocumentPdf";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/axios";
import { settingsApi } from "@/features/settings/api/settingsApi";

interface QuotationDetailProps {
  quotationId: string | number;
}

export function QuotationDetail({ quotationId }: QuotationDetailProps) {
  const router = useRouter();
  const { data: quote, isLoading, isError, error, refetch } = useQuotationDetailQuery(quotationId);
  const { vatRate } = useVatRate();
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
    staleTime: 5 * 60 * 1000,
  });
  const [showPrintModal, setShowPrintModal] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (!quote) return;
    try {
      setIsExporting(true);
      // Download directly from backend Go API
      const token = typeof window !== "undefined" ? localStorage.getItem("chawy_v2_token") : null;
      const response = await fetch(`${API_BASE_URL}/quotations/${quote.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Quotation-${quote.code}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      // Fallback to client-side DOM export if API returns error
      const el = document.getElementById(`quotation-print-${quote.id}`);
      if (!el) {
        setShowPrintModal(true);
        setTimeout(async () => {
          const target = document.getElementById(`quotation-print-${quote.id}`);
          if (target) {
            await exportDocumentPdf(target, `Quotation-${quote.code}.pdf`);
          }
          setIsExporting(false);
        }, 300);
        return;
      }
      await exportDocumentPdf(el, `Quotation-${quote.code}.pdf`);
    } catch (err) {
      // Network failure (API unreachable) — fall back to client-side export
      console.error("PDF export failed:", err);
      const el = document.getElementById(`quotation-print-${quote.id}`);
      if (!el) {
        setShowPrintModal(true);
        setTimeout(async () => {
          const target = document.getElementById(`quotation-print-${quote.id}`);
          if (target) {
            try {
              await exportDocumentPdf(target, `Quotation-${quote.code}.pdf`);
            } catch (exportErr) {
              console.error("Client-side PDF export failed:", exportErr);
              alert("ดาวน์โหลด PDF ไม่สำเร็จ: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง");
            }
          }
          setIsExporting(false);
        }, 300);
        return;
      }
      try {
        await exportDocumentPdf(el, `Quotation-${quote.code}.pdf`);
      } catch (exportErr) {
        console.error("Client-side PDF export failed:", exportErr);
        alert("ดาวน์โหลด PDF ไม่สำเร็จ: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง");
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground text-sm space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>กำลังโหลดข้อมูลใบเสนอราคา...</p>
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
        <p className="text-destructive font-medium">
          {error instanceof Error ? error.message : "ไม่พบข้อมูลใบเสนอราคา หรือเกิดข้อผิดพลาดในการโหลด"}
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

  // Calculate validity on-read
  let isExpired = quote.isExpired;
  let remainingDaysText = "";
  if (quote.validUntil) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(quote.validUntil);
    validDate.setHours(0, 0, 0, 0);

    const diffTime = validDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      if (isExpired === undefined && (quote.status === "Draft" || quote.status === "Sent" || quote.status === "Approved")) {
        isExpired = true;
      }
      remainingDaysText = `หมดอายุแล้ว (${Math.abs(diffDays)} วันก่อน)`;
    } else if (diffDays === 0) {
      remainingDaysText = "หมดอายุวันนี้";
    } else {
      remainingDaysText = `เหลืออีก ${diffDays} วัน`;
    }
  }

  // Calculate totals
  const totalAmount = Number(quote.amount || 0);
  const split = splitVatInclusive(totalAmount, vatRate);
  const subtotal = split.beforeVat;
  const vatAmount = split.vat;

  // Status badge colors
  const getStatusBadge = (status: string, expired?: boolean) => {
    if (expired) {
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800";
    }
    const s = (status || "").toLowerCase();
    if (s === "approved" || s === "converted") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    }
    if (s === "sent") {
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    }
    if (s === "rejected") {
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800";
    }
    return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  };

  return (
    <div className="space-y-6">
      {/* Top navigation & action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/quotation")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            กลับไปรายการ
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <span>ใบเสนอราคา {quote.code}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                quote.status,
                isExpired
              )}`}
            >
              {isExpired ? "Expired (หมดอายุ)" : quote.status}
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quote.soRef && (
            <Link href={`/orders?search=${encodeURIComponent(quote.soRef)}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Tag className="h-3.5 w-3.5 text-primary" />
                ใบสั่งขาย: {quote.soRef}
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
            {isExporting ? "กำลังบันทึก..." : "ดาวน์โหลด PDF"}
          </Button>

          <DocumentActions
            type="quotation"
            id={quote.id}
            code={quote.code}
            status={quote.status}
            amount={quote.amount}
            validUntil={quote.validUntil}
            isExpired={isExpired}
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
              ข้อมูลลูกค้าและการเสนอราคา
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">ชื่อลูกค้า / บริษัท</span>
                <div className="flex items-center gap-3">
                  {quote.customerLogo && (
                    <img
                      src={getImageUrl(quote.customerLogo)}
                      alt={quote.customer}
                      className="h-9 w-9 rounded-md object-contain border border-border bg-muted/40 p-0.5"
                    />
                  )}
                  <p className="font-medium text-foreground">{quote.customer || "—"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">ช่องทางที่มา (Lead Source)</span>
                <p className="font-medium text-foreground">{quote.leadSource || "Manual"}</p>
              </div>

              {quote.customerAddress && (
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> ที่อยู่ลูกค้า
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                    {quote.customerAddress}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> วันที่ออกเอกสาร
                </span>
                <p className="font-medium text-foreground">{thaiDate(quote.date)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> ใช้ได้ถึง (Valid Until)
                </span>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{thaiDate(quote.validUntil)}</p>
                  {remainingDaysText && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        isExpired
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {remainingDaysText}
                    </span>
                  )}
                </div>
              </div>

              {quote.note && (
                <div className="sm:col-span-2 space-y-1 pt-1">
                  <span className="text-xs font-medium text-muted-foreground">เงื่อนไขและหมายเหตุ</span>
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 whitespace-pre-line">
                    {quote.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border/60 pb-3">
              <FileText className="h-4 w-4 text-primary" />
              สรุปยอดเสนอราคา
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>มูลค่าสินค้าก่อนภาษี</span>
                <span className="font-medium text-foreground">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ภาษีมูลค่าเพิ่ม VAT {vatRate}%</span>
                <span className="font-medium text-foreground">{money(vatAmount)}</span>
              </div>
              <div className="h-px bg-border/60 my-2" />
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>ยอดรวมสุทธิ</span>
                <span className="text-primary">{money(totalAmount)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground text-right">(ราคารวม VAT แล้ว)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
            <Package className="h-4 w-4 text-primary" />
            รายการสินค้าเสนอราคา ({quote.lines?.length || 0} รายการ)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground font-medium text-xs border-b border-border/60">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">รหัส SKU</th>
                <th className="py-3 px-4">ชื่อสินค้า / คำอธิบาย</th>
                <th className="py-3 px-4 text-right">จำนวน</th>
                <th className="py-3 px-4 text-right">ราคา/หน่วย</th>
                <th className="py-3 px-4 text-right">รวมเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {!quote.lines || quote.lines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                    ไม่มีรายการสินค้า
                  </td>
                </tr>
              ) : (
                quote.lines.map((line, idx) => {
                  const qty = line.qty ?? line.quantity ?? 0;
                  const price = line.price ?? line.unitPrice ?? 0;
                  const total = line.subtotal ?? qty * price;

                  return (
                    <tr key={line.id || idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-xs font-medium text-foreground">{line.sku}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{line.name}</div>
                        {line.description && (
                          <div className="text-xs text-muted-foreground">{line.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        {qty.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{money(price)}</td>
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
      {quote.auditTrail && quote.auditTrail.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border/60 pb-3">
            <Clock className="h-4 w-4 text-primary" />
            ประวัติการทำรายการ (Timeline / Audit Trail)
          </h3>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {quote.auditTrail.map((item, idx) => (
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
                <h3 className="text-sm font-semibold">ตัวอย่างพิมพ์ใบเสนอราคา</h3>
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
              <QuotationPrintTemplate
                quotation={quote}
                company={settingsData?.company}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

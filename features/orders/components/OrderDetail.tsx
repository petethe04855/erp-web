"use client";

import React, { useState } from "react";
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
  Layers,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderDetailQuery } from "../queries/orderQueries";
import { money, thaiDate } from "../types/order";
import { useVatRate, splitVatInclusive } from "@/features/settings/hooks/useVatRate";
import { getImageUrl } from "@/lib/utils";
import { DocumentActions } from "@/components/common/DocumentActions";
import { downloadBackendPdf } from "@/lib/pdfDownload";

interface OrderDetailProps {
  orderId: string | number;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const { data: order, isLoading, isError, error, refetch } = useOrderDetailQuery(orderId);
  const { vatRate } = useVatRate();
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    if (!order) return;
    try {
      setIsExporting(true);
      await downloadBackendPdf("sales-orders", order.id, `SO-${order.code || order.id}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert(err instanceof Error ? err.message : "ดาวน์โหลด PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground text-sm space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>กำลังโหลดข้อมูลใบสั่งขาย...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
        <p className="text-destructive font-medium">
          {error instanceof Error ? error.message : "ไม่พบข้อมูลใบสั่งขาย หรือเกิดข้อผิดพลาดในการโหลด"}
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

  // Calculate totals
  const isVatIncluded = order.includeVat ?? true;
  const totalAmount = Number(order.amount || 0);
  let subtotal = 0;
  let vatAmount = 0;

  if (isVatIncluded) {
    const split = splitVatInclusive(totalAmount, vatRate);
    subtotal = split.beforeVat;
    vatAmount = split.vat;
  } else {
    subtotal = totalAmount;
    vatAmount = (totalAmount * vatRate) / 100;
  }
  const grandTotal = isVatIncluded ? totalAmount : subtotal + vatAmount;

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "shipped") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    }
    if (s === "confirmed") {
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    }
    if (s === "cancelled") {
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800";
    }
    return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  };

  return (
    <div className="space-y-6">
      {/* Top navigation & action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            กลับไปรายการ
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <span>ใบสั่งขาย {order.code}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.invRef && (
            <Link
              href={order.invoiceId ? `/invoices/${order.invoiceId}` : `/invoices?search=${encodeURIComponent(order.invRef)}`}
            >
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-primary" />
                ใบแจ้งหนี้: {order.invRef}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Button>
            </Link>
          )}

          {["COMPLETED", "SHIPPED"].includes(String(order.status || "").toUpperCase()) && (
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
          )}

          <DocumentActions
            type="order"
            id={order.id}
            code={order.code}
            status={order.status}
            amount={order.amount}
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
              ข้อมูลลูกค้าและช่องทางขาย
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">ชื่อลูกค้า / บริษัท</span>
                <div className="flex items-center gap-3">
                  {order.customerLogo && (
                    <img
                      src={getImageUrl(order.customerLogo)}
                      alt={order.customer}
                      className="h-9 w-9 rounded-md object-contain border border-border bg-muted/40 p-0.5"
                    />
                  )}
                  <p className="font-medium text-foreground">{order.customer || "—"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">ช่องทางการขาย (Channel)</span>
                <p className="font-medium text-foreground">{order.channel || "Manual"}</p>
              </div>

              {order.customerAddress && (
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> ที่อยู่จัดส่ง
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                    {order.customerAddress}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> วันที่ออกเอกสาร
                </span>
                <p className="font-medium text-foreground">{thaiDate(order.date)}</p>
              </div>

              {order.sourceRef && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">เลขอ้างอิงช่องทาง (Source Ref)</span>
                  <p className="font-medium text-foreground">{order.sourceRef}</p>
                </div>
              )}

              {order.note && (
                <div className="sm:col-span-2 space-y-1 pt-1">
                  <span className="text-xs font-medium text-muted-foreground">หมายเหตุ</span>
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 whitespace-pre-line">
                    {order.note}
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
              สรุปยอดเงิน
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
                <span className="text-primary">{money(grandTotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground text-right">
                {isVatIncluded ? "(ราคารวม VAT แล้ว)" : "(ราคาไม่รวม VAT)"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
            <Package className="h-4 w-4 text-primary" />
            รายการสินค้า ({order.lines?.length || 0} รายการ)
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
                <th className="py-3 px-4 text-right">รวมเงิน</th>
                <th className="py-3 px-4 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {(!order.lines || order.lines.length === 0) ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                    ไม่มีรายการสินค้า
                  </td>
                </tr>
              ) : (
                order.lines.map((line, idx) => {
                  const hasAllocations = line.allocations && line.allocations.length > 0;
                  const hasCogs = line.cogs !== undefined && line.cogs !== null;
                  const canExpand = hasAllocations || hasCogs;
                  const isExpanded = !!expandedRows[idx];

                  return (
                    <React.Fragment key={line.id || idx}>
                      <tr 
                        className={`hover:bg-muted/20 transition-colors ${canExpand ? "cursor-pointer" : ""}`}
                        onClick={() => canExpand && toggleRow(idx)}
                      >
                        <td className="py-3 px-4 text-center text-muted-foreground text-xs">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-xs font-medium text-foreground">{line.sku}</td>
                        <td className="py-3 px-4 font-medium text-foreground">{line.name}</td>
                        <td className="py-3 px-4 text-center text-muted-foreground text-xs">{line.unit || "ชิ้น"}</td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">{line.quantity?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{money(line.unitPrice || 0)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">{money(line.subtotal || 0)}</td>
                        <td className="py-3 px-4 text-center">
                          {canExpand && (
                            <button
                              type="button"
                              aria-label={isExpanded ? "ย่อรายละเอียดการจัดสรรสต็อก" : "ขยายรายละเอียดการจัดสรรสต็อก"}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable allocations/cogs row */}
                      {canExpand && isExpanded && (
                        <tr className="bg-muted/30 border-b border-border/40">
                          <td colSpan={8} className="py-3 px-8 text-xs space-y-2">
                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                              {hasCogs && (
                                <div>
                                  <span className="font-medium text-foreground">ต้นทุน (COGS): </span>
                                  {money(line.cogs || 0)}
                                </div>
                              )}
                              {hasAllocations && (
                                <div className="flex items-center gap-2">
                                  <Layers className="h-3.5 w-3.5 text-primary" />
                                  <span className="font-medium text-foreground">Lot จัดสรร:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {line.allocations!.map((alloc, aIdx) => (
                                      <span
                                        key={aIdx}
                                        className="bg-card px-2 py-0.5 rounded border border-border text-[11px] font-mono text-foreground"
                                      >
                                        {alloc.lot || "LOT"}: {alloc.qty} ชิ้น {alloc.expiry ? `(exp: ${alloc.expiry})` : ""}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail / Timeline (Rendered only if provided by API) */}
      {order.auditTrail && order.auditTrail.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground border-b border-border/60 pb-3">
            <Clock className="h-4 w-4 text-primary" />
            ประวัติการทำรายการ (Timeline / Audit Trail)
          </h3>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {order.auditTrail.map((item, idx) => (
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
    </div>
  );
}

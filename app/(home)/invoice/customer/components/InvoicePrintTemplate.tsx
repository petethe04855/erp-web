import React from "react";
import type { Invoice } from "@/lib/store/erpWorkflow";
import type { CompanySettings } from "@/lib/store/erpTypes";
import {
  bahtText,
  balance,
  invoiceLogoUrl,
  money,
  templateId,
  thaiDate,
  type DisplayLine,
} from "./types";

function InvoiceDocHeader({
  company,
  invoice,
}: {
  company: CompanySettings;
  invoice: Invoice;
}) {
  const logoUrl = invoiceLogoUrl(company.logoUrl);
  return (
    <div className="flex items-start justify-between border-b-2 border-gray-900 pb-5">
      <div className="flex items-start gap-4 max-w-[480px]">
        <img
          src={logoUrl}
          alt={company.name}
          crossOrigin="anonymous"
          className="mt-0.5 h-[48px] w-auto object-contain"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-gray-900 leading-tight">
            {company.name}
          </h1>
          <p className="text-[11px] text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
            {company.address}
          </p>
          <div className="text-[11px] text-gray-600 mt-1 flex flex-wrap gap-x-3">
            <span>โทร: {company.phone || "–"}</span>
            <span>อีเมล: {company.email || "–"}</span>
          </div>
          <div className="text-[11px] font-medium text-gray-700 mt-0.5">
            เลขประจำตัวผู้เสียภาษี:{" "}
            <span className="font-mono">{company.taxId || "–"}</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-[22px] font-bold tracking-tight text-gray-900">
          ใบแจ้งหนี้ / ใบวางบิล
        </div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          INVOICE / BILLING NOTE · ต้นฉบับ
        </div>
        <div className="mt-3 text-[12px] space-y-0.5">
          <div>
            <span className="text-gray-500">เลขที่: </span>
            <span className="font-mono font-bold text-gray-900">
              {invoice.code || invoice.id}
            </span>
          </div>
          <div>
            <span className="text-gray-500">วันที่: </span>
            <span className="font-medium text-gray-800">
              {thaiDate(invoice.issueDate)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ครบกำหนด: </span>
            <span className="font-medium text-red-600">
              {thaiDate(invoice.dueDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceCustomerGrid({
  invoice,
  soRef,
}: {
  invoice: Invoice;
  soRef: string;
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-8 border-b border-gray-300 pb-5 text-[12px]">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          ข้อมูลลูกค้า / Bill To:
        </div>
        <div className="text-[14px] font-bold text-gray-900">{invoice.customer}</div>
        <div className="text-gray-600 mt-1 leading-relaxed whitespace-pre-line text-[11px]">
          {invoice.customerAddress || "–"}
        </div>
        <div className="mt-2 text-[11px] text-gray-700">
          {invoice.customerTaxId && (
            <div>
              เลขประจำตัวผู้เสียภาษี:{" "}
              <span className="font-mono">{invoice.customerTaxId}</span>
            </div>
          )}
          <div>สาขา: {invoice.customerBranch || "–"}</div>
        </div>
      </div>

      <div className="self-center space-y-1.5 border-l border-gray-300 pl-6">
        <div className="flex justify-between">
          <span className="text-gray-500">อ้างอิงใบสั่งขาย (SO):</span>
          <span className="font-mono font-medium">{soRef}</span>
        </div>
        {invoice.purchaseOrderRef && (
          <div className="flex justify-between">
            <span className="text-gray-500">อ้างอิงใบสั่งซื้อ (PO):</span>
            <span className="font-mono font-medium">{invoice.purchaseOrderRef}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">เงื่อนไขการชำระ:</span>
          <span className="font-medium">{invoice.paymentTerms || "–"}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-gray-200">
          <span className="text-gray-500">สถานะเอกสาร:</span>
          <span className="text-[11px] font-semibold text-gray-900">
            {invoice.status === "Paid"
              ? "ชำระแล้ว"
              : invoice.status === "Partial"
              ? "ชำระบางส่วน"
              : "ยังไม่ชำระ"}
          </span>
        </div>
      </div>
    </div>
  );
}

function InvoiceLinesTable({ lines }: { lines: DisplayLine[] }) {
  return (
    <div className="mt-6 overflow-hidden border-y border-gray-900">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-gray-900 bg-gray-100 text-gray-900">
            <th className="py-2.5 px-3 text-center w-[44px] font-semibold">#</th>
            <th className="py-2.5 px-3 text-left w-[100px] font-semibold">รหัสสินค้า</th>
            <th className="py-2.5 px-3 text-left font-semibold">รายการสินค้า / รายละเอียด</th>
            <th className="py-2.5 px-3 text-right w-[60px] font-semibold">จำนวน</th>
            <th className="py-2.5 px-3 text-center w-[50px] font-semibold">หน่วย</th>
            <th className="py-2.5 px-3 text-right w-[82px] font-semibold">ราคา/หน่วย</th>
            <th className="py-2.5 px-3 text-right w-[72px] font-semibold">ส่วนลด</th>
            <th className="py-2.5 px-3 text-right w-[95px] font-semibold">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {lines.map((line, idx) => (
            <tr key={line.key} className="bg-white">
              <td className="py-2 px-3 text-center text-gray-500 font-mono">
                {idx + 1}
              </td>
              <td className="py-2 px-3 font-mono font-medium text-gray-700">
                {line.sku}
              </td>
              <td className="py-2 px-3">
                <div className="font-bold text-gray-900">{line.name}</div>
                {line.lot && line.lot !== "UNSPECIFIED" && (
                  <div className="text-[10px] text-gray-500 font-mono">
                    Lot: {line.lot}
                  </div>
                )}
              </td>
              <td className="py-2 px-3 text-right font-mono font-medium">
                {line.qty.toLocaleString("th-TH")}
              </td>
              <td className="py-2 px-3 text-center text-gray-600">
                {line.unit || "ชิ้น"}
              </td>
              <td className="py-2 px-3 text-right font-mono">
                {money(line.unitPrice)}
              </td>
              <td className="py-2 px-3 text-right font-mono">
                {money(line.discount)}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                {money(line.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceTotalsAndPayment({
  invoice,
  company,
  grossAmount,
  discountAmount,
  subtotal,
  vat,
  vatRate,
  total,
}: {
  invoice: Invoice;
  company: CompanySettings;
  grossAmount: number;
  discountAmount: number;
  subtotal: number;
  vat: number;
  vatRate: number;
  total: number;
}) {
  return (
    <div className="mt-6 grid grid-cols-[1.25fr_1fr] gap-10 text-[12px]">
      {/* Left: Payment Info & Notes */}
      <div className="space-y-3">
        <div className="border-t border-gray-400 pt-3">
          <div className="text-[11px] font-bold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            ช่องทางการชำระเงิน (Payment Details)
          </div>
          <div className="space-y-1 text-[11px] text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">เงื่อนไขการชำระ:</span>
              <span className="font-medium">{invoice.paymentTerms || "–"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">วันครบกำหนด:</span>
              <span className="font-medium">{thaiDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ติดต่อฝ่ายบัญชี:</span>
              <span className="font-medium">
                {company.phone || company.email || "–"}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status & Credit Note */}
        <div className="border-t border-gray-300 pt-3 text-[11px]">
          <div className="flex justify-between items-center text-gray-700 mb-1">
            <span>
              ชำระแล้ว:{" "}
              <strong className="font-mono">{money(invoice.paid)}</strong>
            </span>
            {(invoice.credited ?? 0) > 0 && (
              <span>
                Credit Note:{" "}
                <strong className="font-mono text-emerald-600">
                  -{money(invoice.credited ?? 0)}
                </strong>
              </span>
            )}
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-gray-200">
            <span className="font-bold text-gray-900">ยอดคงค้างชำระ:</span>
            <span className="font-mono font-bold text-red-600 text-[13px]">
              {money(balance(invoice))}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Totals Box */}
      <div className="space-y-2 border-t-2 border-gray-900 pt-3">
        <div className="flex justify-between text-gray-700">
          <span>รวมราคาสินค้า/บริการ:</span>
          <span className="font-mono font-medium">{money(grossAmount)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>หักส่วนลด:</span>
          <span className="font-mono font-medium">-{money(discountAmount)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>ยอดรวมก่อนภาษี (Subtotal):</span>
          <span className="font-mono font-medium">{money(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>ภาษีมูลค่าเพิ่ม VAT {vatRate}%:</span>
          <span className="font-mono font-medium">{money(vat)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-[14px] font-bold text-gray-900">
          <span>ยอดรวมสุทธิ (Total Due):</span>
          <span className="font-mono text-[15px]">{money(total)}</span>
        </div>
        <div className="mt-2 border-t border-gray-300 pt-2 text-center text-[10px] font-medium text-gray-800">
          ({bahtText(total)})
        </div>
      </div>
    </div>
  );
}

function InvoiceSignaturesAndFooter({ company }: { company: CompanySettings }) {
  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-16 border-t border-gray-300 pt-6 text-[11px]">
        <div className="p-3 text-center">
          <div className="text-gray-700 font-semibold mb-8">
            ผู้รับใบแจ้งหนี้ / ผู้รับวางบิล
          </div>
          <div className="border-b border-gray-400 w-[200px] mx-auto mb-1.5" />
          <div className="text-[10px] text-gray-500">
            วันที่ _____ / _____ / _________
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="text-gray-700 font-semibold mb-8">
            ผู้มีอำนาจลงนาม / Authorized Signature
          </div>
          <div className="border-b border-gray-400 w-[200px] mx-auto mb-1.5" />
          <div className="text-[10px] text-gray-500">
            วันที่ _____ / _____ / _________
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-100 text-center text-[9px] text-gray-400">
        {company.name} · {company.website || "www.chawypet.com"} ·{" "}
        {company.email} · {company.phone}
      </div>
    </>
  );
}

export interface InvoicePrintTemplateProps {
  invoice: Invoice;
  company: CompanySettings;
  soRef: string;
  lines: DisplayLine[];
}

export function InvoicePrintTemplate({
  invoice,
  company,
  soRef,
  lines,
}: InvoicePrintTemplateProps) {
  const lineSubtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const isVatExempt = invoice.includeVat === false;
  const vatRate = isVatExempt ? 0 : company.vatRate;
  const grossAmount = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const discountAmount = lines.reduce((sum, line) => sum + line.discount, 0);
  const subtotal =
    invoice.subtotal && invoice.subtotal > 0 ? invoice.subtotal : lineSubtotal;
  const vat = isVatExempt ? 0 : invoice.vatAmount || 0;
  const total = invoice.amount || subtotal + vat;

  return (
    <section
      id={templateId(invoice.id)}
      className="box-border flex flex-col justify-between bg-white text-[#1f2937]"
      style={{
        width: "794px",
        height: "1110px",
        minHeight: "1110px",
        maxHeight: "1110px",
        padding: "40px 44px",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div>
        <InvoiceDocHeader company={company} invoice={invoice} />
        <InvoiceCustomerGrid invoice={invoice} soRef={soRef} />
        <InvoiceLinesTable lines={lines} />
      </div>

      <div>
        <InvoiceTotalsAndPayment
          invoice={invoice}
          company={company}
          grossAmount={grossAmount}
          discountAmount={discountAmount}
          subtotal={subtotal}
          vat={vat}
          vatRate={vatRate}
          total={total}
        />
        <InvoiceSignaturesAndFooter company={company} />
      </div>
    </section>
  );
}

import React from "react";
import type { InvoiceDetail } from "../../types/invoice";
import type { Company } from "@/features/settings/api/settingsApi";
import { bahtText, money, thaiDate } from "@/lib/printUtils";

export interface InvoicePrintTemplateProps {
  invoice: InvoiceDetail;
  company?: Company | null;
}

export function InvoicePrintTemplate({
  invoice,
  company,
}: InvoicePrintTemplateProps) {
  const total = Number(invoice.totalAmount || invoice.amount || 0);
  const vatRate = 7;
  const beforeVat = total / (1 + vatRate / 100);
  const vat = total - beforeVat;

  const companyName = company?.name || "Chawy ERP";
  const companyAddress = company?.address || "–";
  const companyTaxId = company?.taxId || "–";
  const companyPhone = company?.phone || "–";
  const companyEmail = company?.email || "–";

  const lines = invoice.lines || [];

  return (
    <div className="flex justify-center p-4 bg-neutral-100 overflow-auto">
      <section
        id={`invoice-print-${invoice.id}`}
        style={{
          width: "794px",
          minHeight: "1122px",
          boxSizing: "border-box",
        }}
        className="box-border flex min-h-[1122px] w-[794px] flex-col justify-between overflow-hidden bg-white px-10 pb-12 pt-10 text-[#1f2937] shadow-lg rounded-sm"
      >
        <div>
          <header className="flex items-start justify-between border-b-2 border-gray-800 pb-4">
            <div className="flex max-w-[450px] items-start gap-3">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={companyName}
                  crossOrigin="anonymous"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                  LOGO
                </div>
              )}
              <div className="text-[10px] leading-[1.45] text-gray-700">
                <div className="text-[15px] font-bold text-gray-900">
                  {companyName}
                </div>
                <div className="whitespace-pre-line">
                  {companyAddress}
                </div>
                <div>เลขประจำตัวผู้เสียภาษี {companyTaxId}</div>
                <div>
                  {companyPhone} · {companyEmail}
                </div>
              </div>
            </div>
            <div className="min-w-[250px] text-right">
              <h1 className="text-[24px] font-bold leading-none text-black">
                ใบแจ้งหนี้
              </h1>
              <div className="mt-2 text-[10px] tracking-[0.18em] text-gray-500 font-medium">
                INVOICE · ต้นฉบับ
              </div>
              <div className="mt-3 grid grid-cols-[70px_1fr] gap-y-1 text-[10px]">
                <span className="text-left text-black">เลขที่</span>
                <b className="font-mono">{invoice.invoiceNo || invoice.code}</b>
                <span className="text-left text-black">วันที่</span>
                <span>{thaiDate(invoice.issueDate || invoice.date)}</span>
                <span className="text-left text-black">ครบกำหนด</span>
                <span>{thaiDate(invoice.dueDate)}</span>
                <span className="text-left text-black">ใบสั่งขาย</span>
                <span>{invoice.soRef || invoice.orderNo || "–"}</span>
              </div>
            </div>
          </header>

          <div className="mt-6 border-b border-gray-300 pb-4 text-[10px]">
            <div className="mb-1 font-bold text-black">ลูกค้า</div>
            <div className="text-[13px] font-bold text-gray-900">
              {invoice.customerName || invoice.customer}
            </div>
            <div className="mt-1 whitespace-pre-line text-gray-600">
              {invoice.customerAddress || "–"}
            </div>
            {(invoice.customerTaxId || invoice.customerBranch) && (
              <div className="mt-1 text-gray-600">
                {invoice.customerTaxId && (
                  <span>เลขประจำตัวผู้เสียภาษี {invoice.customerTaxId}</span>
                )}
                {invoice.customerTaxId && invoice.customerBranch && " · "}
                {invoice.customerBranch && (
                  <span>สาขา {invoice.customerBranch}</span>
                )}
              </div>
            )}
          </div>

          <table className="mt-6 w-full border-collapse text-[11px]">
            <thead className="border-y-2 border-gray-500 bg-gray-100">
              <tr className="h-10 align-middle">
                <th className="p-2 text-center w-12">#</th>
                <th className="p-2 text-left">รายละเอียด</th>
                <th className="p-2 text-right w-16">จำนวน</th>
                <th className="p-2 text-center w-16">หน่วย</th>
                <th className="p-2 text-right w-24">ราคาต่อหน่วย</th>
                <th className="p-2 text-right w-24">ส่วนลด</th>
                <th className="p-2 text-right w-28">มูลค่า</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => {
                const qty = Number(line.quantity || line.qty || 1);
                const unitPrice = Number(line.unitPrice || line.price || 0);
                const discount = Number(line.discount || 0);
                const lineTotal = Number(line.lineTotal || line.subtotal || qty * unitPrice - discount);

                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2">
                      <b className="text-gray-900">{line.name || line.sku}</b>
                      {line.sku && (
                        <div className="font-mono text-[9px] text-gray-500">
                          {line.sku}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right">{qty}</td>
                    <td className="p-2 text-center">{line.unit || "ชิ้น"}</td>
                    <td className="p-2 text-right">{money(unitPrice)}</td>
                    <td className="p-2 text-right">{money(discount)}</td>
                    <td className="p-2 text-right font-bold text-gray-900">
                      {money(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <div className="grid grid-cols-[1.2fr_1fr] gap-10 text-[11px]">
            <div>
              <div className="font-bold text-black">หมายเหตุ</div>
              <div className="mt-2 text-gray-600">
                ครบกำหนดชำระ {thaiDate(invoice.dueDate)}
              </div>
              {invoice.paymentMethod && (
                <div className="text-gray-600">
                  วิธีชำระเงิน {invoice.paymentMethod}
                </div>
              )}
            </div>
            <div className="space-y-2 border-t-2 border-gray-900 pt-3">
              <div className="flex justify-between">
                <span>ราคาสินค้าก่อนภาษี</span>
                <span>{money(beforeVat)}</span>
              </div>
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม 7%</span>
                <span>{money(vat)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-[14px] font-bold text-black">
                <span>จำนวนเงินรวมทั้งสิ้น</span>
                <span>{money(total)}</span>
              </div>
              <div className="text-center text-[10px] text-gray-700 font-medium pt-1">
                ({bahtText(total)})
              </div>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-20 text-center text-[11px]">
            <div>
              <div className="mb-10">ผู้รับสินค้า / ผู้ซื้อ</div>
              <div className="border-b border-gray-400" />
              <div className="mt-2">วันที่ _____ / _____ / _________</div>
            </div>
            <div>
              <div className="mb-10">ผู้อนุมัติ / ผู้ขาย</div>
              <div className="border-b border-gray-400" />
              <div className="mt-2">วันที่ _____ / _____ / _________</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

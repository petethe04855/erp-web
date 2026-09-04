import type { Quotation } from "@/lib/mockData";
import type { CompanySettings } from "@/lib/store/erpTypes";
import {
  bahtText,
  invoiceLogoUrl,
  money,
  thaiDate,
  type DisplayLine,
} from "../../invoice/customer/components/types";

export function QuotationPrintTemplate({
  quotation,
  company,
  lines,
  seller,
}: {
  quotation: Quotation;
  company: CompanySettings;
  lines: DisplayLine[];
  seller: string;
}) {
  const total = quotation.amount;
  const vatRate = company.vatRate || 7;
  const beforeVat = vatRate > 0 ? total / (1 + vatRate / 100) : total;
  const vat = total - beforeVat;
  const creditDays = Math.max(
    0,
    Math.round(
      (new Date(quotation.validUntil).getTime() -
        new Date(quotation.date).getTime()) /
        86400000,
    ),
  );
  const logo = invoiceLogoUrl(company.logoUrl);

  return (
    <section
      id={`quotation-form-${quotation.id}`}
      className="quotation-card box-border flex h-[1122px] w-[794px] flex-col justify-between overflow-hidden bg-white px-10 pb-12 pt-10 text-[#1f2937]"
    >
      <div>
        <header className="flex items-start justify-between border-b-2 border-gray-800 pb-4">
          <div className="flex max-w-[450px] items-start gap-3">
            <img
              src="/assets/images/company-logo.jpg"
              alt={company.name}
              crossOrigin="anonymous"
              width={72}
              height={12}
              className="object-contain"
            />
            <div className="text-[10px] leading-[1.45] text-gray-700">
              <div className="text-[15px] font-bold text-gray-900">
                {company.name}
              </div>
              <div className="whitespace-pre-line">
                {company.address || "–"}
              </div>
              <div>เลขประจำตัวผู้เสียภาษี {company.taxId || "–"}</div>
              <div>
                {company.phone || "–"} · {company.email || "–"}
              </div>
            </div>
          </div>
          <div className="min-w-[250px] text-right">
            <h1 className="text-[24px] font-bold leading-none text-text-black">
              ใบเสนอราคา
            </h1>
            <div className="mt-2 text-[10px] tracking-[0.18em] text-gray-500">
              QUOTATION · ต้นฉบับ
            </div>
            <div className="mt-3 grid grid-cols-[70px_1fr] gap-y-1 text-[10px]">
              <span className="text-left text-text-black">เลขที่</span>
              <b>{quotation.code || quotation.id}</b>
              <span className="text-left text-text-black">วันที่</span>
              <span>{thaiDate(quotation.date)}</span>
              <span className="text-left text-text-black">เครดิต</span>
              <span>{creditDays} วัน</span>
              <span className="text-left text-text-black">ผู้ขาย</span>
              <span>{seller}</span>
              <span className="text-left text-text-black">ชื่องาน</span>
              <span>{quotation.leadSource || "–"}</span>
            </div>
          </div>
        </header>

        <div className="mt-6 border-b border-gray-300 pb-4 text-[10px]">
          <div className="mb-1 font-bold text-text-black">ลูกค้า</div>
          <div className="text-[13px] font-bold text-gray-900">
            {quotation.customer}
          </div>
          <div className="mt-1 whitespace-pre-line text-gray-600">
            {quotation.customerAddress || "–"}
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-[11px]">
          <colgroup>
            <col style={{ width: "6%" }} />
            <col style={{ width: "50%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
          </colgroup>
          <thead className="border-y-2 border-gray-500 bg-gray-100">
            <tr className="h-10 align-middle">
              <th className="h-11 p-0">
                <span
                  style={{
                    display: "flex",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  #
                </span>
              </th>
              <th className="h-11 p-0">
                <span
                  style={{
                    display: "flex",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    padding: "0 8px",
                  }}
                >
                  รายละเอียด
                </span>
              </th>
              <th className="h-11 p-0">
                <span
                  style={{
                    display: "flex",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  จำนวน
                </span>
              </th>
              <th className="h-11 p-0">
                <span
                  style={{
                    display: "flex",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  หน่วย
                </span>
              </th>
              <th className="h-11 p-0">
                <span
                  style={{
                    display: "flex",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  ราคาต่อหน่วย
                </span>
              </th>
              <th className="h-11 p-0">
                <span
                  style={{
                    display: "flex",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  ส่วนลด
                </span>
              </th>
              <th className="h-11 p-0">
                <span
                  style={{
                    display: "flex",
                    height: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  มูลค่า
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={line.key} className="border-b border-gray-200">
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2">
                  <b>{line.name}</b>
                  <div className="font-mono text-[9px] text-gray-500">
                    {line.sku}
                  </div>
                </td>
                <td className="p-2 text-right">{line.qty}</td>
                <td className="p-2 text-center">{line.unit || "ชิ้น"}</td>
                <td className="p-2 text-right">{money(line.unitPrice)}</td>
                <td className="p-2 text-right">{money(line.discount)}</td>
                <td className="p-2 text-right font-bold">
                  {money(line.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="grid grid-cols-[1.2fr_1fr] gap-10 text-[11px]">
          <div>
            <div className="font-bold text-text-black">หมายเหตุ</div>
            <div className="mt-2 text-gray-600">
              ราคานี้ยืนตามวันที่กำหนดในใบเสนอราคา
            </div>
          </div>
          <div className="space-y-2 border-t-2 border-gray-900 pt-3">
            <div className="flex justify-between">
              <span>รวมเป็นเงิน</span>
              <b>{money(total)}</b>
            </div>
            <div className="flex justify-between">
              <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
              <span>{money(vat)}</span>
            </div>
            <div className="flex justify-between">
              <span>ราคาสินค้าก่อนภาษี</span>
              <span>{money(beforeVat)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-[14px] font-bold">
              <span>จำนวนเงินรวมทั้งสิ้น</span>
              <span>{money(total)}</span>
            </div>
            <div className="text-center text-[10px]">({bahtText(total)})</div>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-20 text-center text-[11px]">
          <div>
            <div className="mb-10">ผู้สั่งซื้อสินค้า</div>
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
  );
}

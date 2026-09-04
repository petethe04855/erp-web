import type { Invoice } from "@/lib/store/erpWorkflow";

export type DisplayLine = {
  key: number | string;
  sku: string;
  lot: string;
  name: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  discount: number;
  total: number;
};

export interface CustomerTotals {
  original: number;
  credited: number;
  paid: number;
  outstanding: number;
  overdue: number;
}

export const balance = (invoice: Invoice) =>
  Math.max(0, invoice.amount - (invoice.credited ?? 0) - invoice.paid);

export const money = (value: number) =>
  `฿${value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const today = () => new Date().toISOString().slice(0, 10);

export const templateId = (invoiceId: number | string) => `invoice-form-${invoiceId}`;

export const thaiDate = (value: string) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "–";

export const thaiIntegerText = (value: number, isMillionRemainder = false): string => {
  const digitNames = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const placeNames = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];
  if (value === 0) return isMillionRemainder ? "" : digitNames[0];
  if (value >= 1_000_000) {
    const millions = Math.floor(value / 1_000_000);
    const remainder = value % 1_000_000;
    return `${thaiIntegerText(millions)}ล้าน${thaiIntegerText(remainder, true)}`;
  }
  const digits = String(value).split("").map(Number);
  const len = digits.length;
  return digits
    .map((digit, index) => {
      if (digit === 0) return "";
      const place = len - index - 1;
      if (place === 1 && digit === 1) return "สิบ";
      if (place === 1 && digit === 2) return "ยี่สิบ";
      if (place === 0 && digit === 1 && (len > 1 || isMillionRemainder)) return "เอ็ด";
      return `${digitNames[digit]}${placeNames[place]}`;
    })
    .join("");
};

export const bahtText = (value: number) => {
  if (isNaN(value) || value < 0) return "";
  const rounded = Math.round(value * 100);
  const baht = Math.floor(rounded / 100);
  const satang = rounded % 100;
  if (baht === 0 && satang === 0) return "ศูนย์บาทถ้วน";
  let text = "";
  if (baht > 0) text += `${thaiIntegerText(baht)}บาท`;
  if (satang > 0) text += `${thaiIntegerText(satang)}สตางค์`;
  else text += "ถ้วน";
  return text;
};

export const invoiceLogoUrl = (logoUrl?: string) => {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";
  if (!logoUrl) return `${apiBase}/api/images/logo.png`;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  return `${apiBase}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`;
};

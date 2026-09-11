export interface OrderItem {
  id: number;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface OrderDetailLine {
  id?: number;
  sku: string;
  name: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  cogs?: number;
  allocations?: Array<{
    lot?: string;
    qty?: number;
    expiry?: string;
  }>;
}

export interface OrderDetail {
  id: number;
  code: string;
  customer: string;
  customerAddress?: string;
  customerLogo?: string;
  channel?: string;
  date: string;
  amount: number;
  status: string;
  note?: string;
  qtRef?: string;
  sourceRef?: string;
  invRef?: string;
  invoiceId?: number;
  includeVat?: boolean;
  lines: OrderDetailLine[];
  itemsCount: number;
  auditTrail?: Array<{
    action: string;
    actor: string;
    timestamp: string;
  }>;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  fulfillmentStatus: string;
  paymentStatus: string;
  channel?: string;
  itemsCount: number;
  includeVat?: boolean;
}

export interface OrderQueryParams {
  search?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  channel?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderDTO {
  customerName: string;
  channel?: string;
  includeVat?: boolean;
  items: Array<{
    sku: string;
    quantity: number;
    price: number;
  }>;
}

export const money = (value: number) =>
  `฿${value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const thaiDate = (value: string) => {
  if (!value) return "–";
  try {
    const d = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}:00`);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

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


/** Journal source types produced by the expense lifecycle (see erp-api finance/posting.go). */
export const EXPENSE_SOURCE_TYPES = ["expense", "expense_reversal", "expense_revision"] as const;

export function isExpenseSource(sourceType?: string | null): boolean {
  return !!sourceType && (EXPENSE_SOURCE_TYPES as readonly string[]).includes(sourceType);
}

const SOURCE_LABELS: Record<string, string> = {
  expense: "ค่าใช้จ่าย",
  expense_reversal: "กลับรายการค่าใช้จ่าย",
  expense_revision: "ค่าใช้จ่าย (แก้ไข)",
  goods_receipt: "รับสินค้า",
  order_delivery: "ส่งสินค้า",
  sales_delivery: "ส่งสินค้า",
  customer_invoice: "ใบแจ้งหนี้",
  customer_payment: "รับชำระ",
  sales_return: "รับคืน",
  sales_return_stock: "รับคืนเข้าสต็อก",
  quotation: "ใบเสนอราคา",
  purchase_order: "ใบสั่งซื้อ",
};

export function sourceTypeLabel(sourceType: string): string {
  return SOURCE_LABELS[sourceType] || sourceType;
}

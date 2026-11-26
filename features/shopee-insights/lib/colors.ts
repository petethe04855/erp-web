/**
 * Colours shared by the set-size chart and the Sankey, so "3 ถุง" is the same
 * colour everywhere (spec §6). Orange is the Shopee colour used across the ERP.
 */
const SET_COLORS: Record<number, string> = {
  1: "#a3a3a3",
  3: "#f97316",
  5: "#0ea5e9",
  10: "#8b5cf6",
};
const EXTRA = ["#14b8a6", "#eab308", "#ec4899", "#22c55e", "#6366f1"];

export function setColor(size: number): string {
  return SET_COLORS[size] ?? EXTRA[size % EXTRA.length];
}

export const ROD_COLOR = "#171717";
export const OTHER_COLOR = "#d97706";
export const STOP_COLOR = "#d4d4d4";

/** Colour of a Sankey node / product label from the API. */
export function journeyColor(node: string): string {
  const m = node.match(/^ฟรีซดราย (\d+) ถุง$/);
  if (m) return setColor(parseInt(m[1], 10));
  if (node === "ไม้ตกแมว") return ROD_COLOR;
  if (node === "ยังไม่ซื้อต่อ") return STOP_COLOR;
  return OTHER_COLOR;
}

export const CATEGORY_COLORS: Record<string, string> = {
  ฟรีซดรายโปรผสม: "#f97316",
  ฟรีซดรายชนิดเดี่ยว: "#0ea5e9",
  ของเล่นแมว: "#171717",
  อื่นๆ: "#a3a3a3",
};

/** Counts (orders, sets, customers) are solid; baht and % are dashed (spec §6). */
export const AMOUNT_DASH = [6, 4];
export const COUNT_COLOR = "#171717";
export const AMOUNT_COLOR = "#f97316";

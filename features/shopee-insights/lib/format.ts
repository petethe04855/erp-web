import type { InsightKPI, InsightRange } from "../types";

const THAI_MONTHS = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "2026-10" → "ต.ค. 2026" (the spec writes years in C.E.). */
export function monthLabel(ym: string, withYear = true): string {
  const [y, m] = ym.split("-");
  const name = THAI_MONTHS[parseInt(m, 10)] || m;
  return withYear ? `${name} ${y}` : name;
}

/** "ม.ค.–ต.ค. 2026", or across years "พ.ย. 2025–ก.พ. 2026". */
export function rangeLabel(r: InsightRange): string {
  if (r.from === r.to) return monthLabel(r.from);
  if (r.from.slice(0, 4) === r.to.slice(0, 4)) return `${monthLabel(r.from, false)}–${monthLabel(r.to)}`;
  return `${monthLabel(r.from)}–${monthLabel(r.to)}`;
}

export const baht = (v: number) => v.toLocaleString("th-TH", { maximumFractionDigits: 0 });
export const num = (v: number) => v.toLocaleString("th-TH");
export const pct1 = (v: number) => `${v.toLocaleString("th-TH", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const RANGE_PRESETS = [
  { id: "ytd", label: "ปีนี้" },
  { id: "3m", label: "3 เดือน" },
  { id: "6m", label: "6 เดือน" },
  { id: "12m", label: "12 เดือน" },
  { id: "last-year", label: "ปีที่แล้ว" },
] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number]["id"];

/** The month range of a preset, counted back from `today`'s month. */
export function presetRange(preset: RangePreset, today = new Date()): InsightRange {
  const back = (n: number) => ym(new Date(today.getFullYear(), today.getMonth() - n, 1));
  switch (preset) {
    case "ytd":
      return { from: `${today.getFullYear()}-01`, to: ym(today) };
    case "3m":
      return { from: back(2), to: ym(today) };
    case "6m":
      return { from: back(5), to: ym(today) };
    case "12m":
      return { from: back(11), to: ym(today) };
    case "last-year":
      return { from: `${today.getFullYear() - 1}-01`, to: `${today.getFullYear() - 1}-12` };
  }
}

const YM = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Reads `?from=&to=`; falls back to this year when missing or invalid. */
export function rangeFromSearch(search: string, today = new Date()): InsightRange {
  const p = new URLSearchParams(search);
  const from = p.get("from") ?? "";
  const to = p.get("to") ?? "";
  if (YM.test(from) && YM.test(to) && from <= to) return { from, to };
  return presetRange("ytd", today);
}

export interface SummarySentence {
  /** Text before the change, the change itself (coloured), and the rest. */
  lead: string;
  change: string | null;
  trend: "up" | "down" | "flat" | null;
  tail: string;
}

/**
 * The header sentence of the spec: "เดือน ต.ค. 2026 ขายได้ 44,034 บาท ลดลง 6.0%
 * จากเดือนก่อน ลูกค้าที่ซื้อซ้ำมี 24.0% ของลูกค้าทั้งหมด ทำยอดได้ 59.0% ของยอดขาย"
 */
export function summarySentence(k: InsightKPI): SummarySentence | null {
  if (!k.last_month) return null;
  const lead = `เดือน ${monthLabel(k.last_month)} ขายได้ ${baht(k.last_sales)} บาท`;
  let change: string | null = null;
  let trend: SummarySentence["trend"] = null;
  if (k.mom_pct !== null) {
    trend = k.mom_pct > 0 ? "up" : k.mom_pct < 0 ? "down" : "flat";
    change =
      trend === "flat"
        ? "เท่ากับเดือนก่อน"
        : `${trend === "up" ? "เพิ่มขึ้น" : "ลดลง"} ${pct1(Math.abs(k.mom_pct))} จากเดือนก่อน`;
  }
  const tail =
    k.customers > 0
      ? `ลูกค้าที่ซื้อซ้ำมี ${pct1(k.repeat_pct)} ของลูกค้าทั้งหมด ทำยอดได้ ${pct1(k.repeat_sales_pct)} ของยอดขาย`
      : "";
  return { lead, change, trend, tail };
}

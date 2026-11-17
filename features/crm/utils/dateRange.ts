/** Date helpers for CRM report filters. All dates are local calendar dates (YYYY-MM-DD). */

/** Formats a Date as local YYYY-MM-DD (toISOString would shift to UTC and lose a day in UTC+7). */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DatePresetKey = "7d" | "30d" | "90d" | "1y" | "month";

export const DATE_PRESETS: { key: DatePresetKey; label: string }[] = [
  { key: "7d", label: "7 วัน" },
  { key: "30d", label: "30 วัน" },
  { key: "90d", label: "90 วัน" },
  { key: "1y", label: "1 ปี" },
  { key: "month", label: "เดือนนี้" },
];

const PRESET_DAYS: Record<Exclude<DatePresetKey, "month">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/** Date range for a preset, ending today. */
export function datePresetRange(key: DatePresetKey, today: Date = new Date()): { dateFrom: string; dateTo: string } {
  const start =
    key === "month"
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() - PRESET_DAYS[key]);
  return { dateFrom: toLocalDateString(start), dateTo: toLocalDateString(today) };
}

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function parseDay(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

/** Short 2-digit year (Gregorian), e.g. 2026 -> "26". */
const yy = (y: number) => String(y).slice(-2);

/** "17-23 พ.ย. 25" or "29 ธ.ค. 25 - 4 ม.ค. 26" for a week range. */
export function formatWeekRange(startDate: string, endDate: string): string {
  const a = parseDay(startDate);
  const b = parseDay(endDate);
  if (a.y === b.y && a.m === b.m) return `${a.d}-${b.d} ${THAI_MONTHS[a.m - 1]} ${yy(a.y)}`;
  if (a.y === b.y) return `${a.d} ${THAI_MONTHS[a.m - 1]} - ${b.d} ${THAI_MONTHS[b.m - 1]} ${yy(b.y)}`;
  return `${a.d} ${THAI_MONTHS[a.m - 1]} ${yy(a.y)} - ${b.d} ${THAI_MONTHS[b.m - 1]} ${yy(b.y)}`;
}

/** "17 พ.ย. 2025" */
export function formatThaiDate(date: string): string {
  const { y, m, d } = parseDay(date);
  return `${d} ${THAI_MONTHS[m - 1]} ${y}`;
}

/** "17 พ.ย. 25" */
export function formatThaiDateShort(date: string): string {
  const { y, m, d } = parseDay(date);
  return `${d} ${THAI_MONTHS[m - 1]} ${yy(y)}`;
}

/** "2026-03" -> "มี.ค. 26" */
export function formatMonth(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return `${THAI_MONTHS[m - 1]} ${yy(y)}`;
}

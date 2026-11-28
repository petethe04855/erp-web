import type { FinancialSummary, MonthReport, Platform, RevenueRow } from "../types/dashboard";
import { platformOfChannel } from "./platforms";

const THAI_MONTHS = [
  "",
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** "2026-11" → "พ.ย. 2569" */
export function formatThaiMonth(ym: string): string {
  if (!ym) return "";
  const parts = ym.split("-");
  if (parts.length < 2) return ym;
  const monthNum = parseInt(parts[1], 10);
  const yearNum = parseInt(parts[0], 10) + 543;
  return `${THAI_MONTHS[monthNum] || parts[1]} ${yearNum}`;
}

/** "2026-11-18" → "18 พ.ย." */
export function formatThaiDay(date: string): string {
  const [, m, d] = date.slice(0, 10).split("-");
  if (!m || !d) return date;
  return `${parseInt(d, 10)} ${THAI_MONTHS[parseInt(m, 10)] || m}`;
}

const customerName = (r: RevenueRow) => (r.customer || "").trim();

export interface OrderSummary {
  revenue: number;
  /** Distinct document references (one bill each). */
  orders: number;
  /** Distinct named customers; rows without a customer name are not counted. */
  customers: number;
}

/** Totals of the revenue-report rows (TikTok and Manual; Shopee has no rows). */
export function summarizeOrders(rows: RevenueRow[]): OrderSummary {
  const refs = new Set<string>();
  const customers = new Set<string>();
  let revenue = 0;
  for (const r of rows) {
    revenue += r.amount;
    refs.add(r.reference);
    const name = customerName(r);
    if (name) customers.add(name);
  }
  return { revenue, orders: refs.size, customers: customers.size };
}

export interface CustomerStat {
  name: string;
  orders: number;
  amount: number;
  /** Share of the named customers' total, 0–100. */
  share: number;
  platforms: Platform[];
  /** The platform this customer spent the most on (for colouring). */
  mainPlatform: Platform;
  lastDate: string;
}

/** Named customers ranked by amount spent, then by number of bills. */
export function rankCustomers(rows: RevenueRow[]): CustomerStat[] {
  const byName = new Map<
    string,
    { refs: Set<string>; amount: number; perPlatform: Partial<Record<Platform, number>>; lastDate: string }
  >();
  for (const r of rows) {
    const name = customerName(r);
    if (!name) continue;
    let c = byName.get(name);
    if (!c) {
      c = { refs: new Set(), amount: 0, perPlatform: {}, lastDate: "" };
      byName.set(name, c);
    }
    const p = platformOfChannel(r.channel);
    c.refs.add(r.reference);
    c.amount += r.amount;
    c.perPlatform[p] = (c.perPlatform[p] ?? 0) + r.amount;
    const date = (r.date || "").slice(0, 10);
    if (date > c.lastDate) c.lastDate = date;
  }

  const total = [...byName.values()].reduce((sum, c) => sum + c.amount, 0);
  return [...byName.entries()]
    .map(([name, c]) => {
      const entries = Object.entries(c.perPlatform) as [Platform, number][];
      const mainPlatform = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      return {
        name,
        orders: c.refs.size,
        amount: c.amount,
        share: total > 0 ? (c.amount / total) * 100 : 0,
        platforms: entries.map(([p]) => p),
        mainPlatform,
        lastDate: c.lastDate,
      };
    })
    .sort((a, b) => b.amount - a.amount || b.orders - a.orders || a.name.localeCompare(b.name, "th"));
}

/** A slice of the period (a week of a month, or a month of a year) with its sales. */
export interface SalesBucket {
  /** 1-based position: week of the month, or month of the year. */
  key: number;
  /** "สัปดาห์ 2" or "ก.พ." */
  label: string;
  /** Date range shown next to the label ("8–14 พ.ย."); empty for months. */
  range: string;
  from: string;
  to: string;
  totals: Partial<Record<Platform, number>>;
  total: number;
  /** Bills from the revenue report (TikTok and Manual only). */
  orders: number;
}

const sumTotals = (totals: Partial<Record<Platform, number>>) =>
  Object.values(totals).reduce<number>((a, b) => a + (b ?? 0), 0);

/**
 * Groups a month's daily series into weeks of the month (days 1–7, 8–14,
 * 15–21, 22–28, 29–end), with bill counts from the revenue rows.
 */
export function weeklyBuckets(
  labels: string[],
  series: Partial<Record<Platform, number[]>>,
  platforms: Platform[],
  rows: RevenueRow[],
): SalesBucket[] {
  const weeks: SalesBucket[] = [];
  for (let start = 0; start < labels.length; start += 7) {
    const end = Math.min(start + 7, labels.length) - 1;
    const totals: Partial<Record<Platform, number>> = {};
    for (const p of platforms) {
      totals[p] = (series[p] ?? []).slice(start, end + 1).reduce((a, b) => a + b, 0);
    }
    const key = weeks.length + 1;
    const from = labels[start];
    const to = labels[end];
    weeks.push({ key, label: `สัปดาห์ ${key}`, range: weekRangeLabel({ from, to }), from, to, totals, total: sumTotals(totals), orders: 0 });
  }

  const refsByWeek = weeks.map(() => new Set<string>());
  for (const r of rows) {
    const day = parseInt((r.date || "").slice(8, 10), 10);
    const w = Math.floor((day - 1) / 7);
    if (refsByWeek[w] && (r.date || "").slice(0, 7) === labels[0]?.slice(0, 7)) refsByWeek[w].add(r.reference);
  }
  weeks.forEach((w, i) => (w.orders = refsByWeek[i].size));
  return weeks;
}

/** A Shopee monthly total (by transfer month). */
export interface ShopeeMonthPoint {
  month: string;
  gross_sale: number;
}

/**
 * One bucket per month: TikTok and Manual from the revenue rows, Shopee from
 * its monthly trend.
 */
export function monthlyBuckets(
  months: string[],
  platforms: Platform[],
  rows: RevenueRow[],
  shopeeMonthly: ShopeeMonthPoint[],
): SalesBucket[] {
  const index = new Map(months.map((m, i) => [m, i]));
  const totals = months.map(() => {
    const t: Partial<Record<Platform, number>> = {};
    for (const p of platforms) t[p] = 0;
    return t;
  });
  const refs = months.map(() => new Set<string>());

  for (const r of rows) {
    const i = index.get((r.date || "").slice(0, 7));
    const p = platformOfChannel(r.channel);
    if (i === undefined || totals[i][p] === undefined) continue;
    totals[i][p]! += r.amount;
    refs[i].add(r.reference);
  }
  if (platforms.includes("shopee")) {
    for (const s of shopeeMonthly) {
      const i = index.get(s.month.slice(0, 7));
      if (i !== undefined) totals[i].shopee! += s.gross_sale;
    }
  }

  return months.map((m, i) => {
    const [y, mm] = m.split("-").map((n) => parseInt(n, 10));
    const last = new Date(y, mm, 0).getDate();
    return {
      key: mm,
      label: THAI_MONTHS[mm] || m,
      range: "",
      from: `${m}-01`,
      to: `${m}-${String(last).padStart(2, "0")}`,
      totals: totals[i],
      total: sumTotals(totals[i]),
      orders: refs[i].size,
    };
  });
}

/** The bucket with the highest sales, or null when nothing was sold. */
export function peakBucket(buckets: SalesBucket[]): SalesBucket | null {
  const best = buckets.reduce<SalesBucket | null>((a, b) => (!a || b.total > a.total ? b : a), null);
  return best && best.total > 0 ? best : null;
}

/** "1–7 พ.ย." */
export function weekRangeLabel(w: { from: string; to: string }): string {
  if (w.from === w.to) return formatThaiDay(w.to);
  const from = parseInt(w.from.slice(8, 10), 10);
  return `${from}–${formatThaiDay(w.to)}`;
}

/** Months of a year (YYYY-MM), stopping at the current month for this year; none for a future year. */
export function monthsOfYear(year: number, currentYM: string): string[] {
  const all = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
  return all.filter((m) => m <= currentYM);
}

/** Adds up several months' revenue and accounting; margins are recomputed from the sums. */
export function mergeMonthReports(parts: MonthReport[]): MonthReport {
  if (parts.length === 1) return parts[0];
  const byChannel: Record<string, number> = {};
  const rows: RevenueRow[] = [];
  let total = 0;
  const f = { revenue: 0, cogs: 0, grossProfit: 0, operatingExpenses: 0, damageLoss: 0, netProfit: 0 };

  for (const { revenue, financial } of parts) {
    rows.push(...(revenue.rows ?? []));
    total += revenue.total ?? 0;
    for (const [ch, v] of Object.entries(revenue.byChannel ?? {})) byChannel[ch] = (byChannel[ch] ?? 0) + v;
    for (const k of Object.keys(f) as (keyof typeof f)[]) f[k] += financial?.[k] ?? 0;
  }

  const margin = (v: number) => (f.revenue > 0 ? (v / f.revenue) * 100 : 0);
  return {
    revenue: { rows, total, byChannel },
    financial: { ...f, grossMargin: margin(f.grossProfit), netMargin: margin(f.netProfit) } as FinancialSummary,
  };
}

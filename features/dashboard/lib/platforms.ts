import type { DashboardData, Platform } from "../types/dashboard";
import { ALL_PLATFORMS } from "../types/dashboard";

export const PLATFORM_META: Record<
  Platform,
  { label: string; dot: string; active: string; color: string }
> = {
  tiktok: {
    label: "TikTok Shop",
    color: "#171717",
    dot: "bg-cyan-500",
    active: "border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
  },
  shopee: {
    label: "Shopee",
    color: "#F97316",
    dot: "bg-orange-500",
    active: "border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200",
  },
  manual: {
    label: "อื่นๆ (Manual)",
    color: "#3B82F6",
    dot: "bg-blue-500",
    active: "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  },
};

/** Maps a revenue-report channel name to its platform (the report has TikTok and Manual). */
export function platformOfChannel(raw: string): Platform {
  const upper = (raw || "").toUpperCase();
  if (upper.includes("TIKTOK") || upper.includes("TIK TOK")) return "tiktok";
  if (upper.includes("SHOPEE")) return "shopee";
  return "manual";
}

/** Parses `?platform=tiktok,shopee` (and the legacy `?tab=shopee|tiktok`). */
export function platformsFromSearch(search: string): Platform[] | null {
  const params = new URLSearchParams(search);
  const raw = params.get("platform");
  if (raw) {
    const list = raw.split(",").filter((p): p is Platform => (ALL_PLATFORMS as string[]).includes(p));
    if (list.length) return list;
  }
  const tab = params.get("tab");
  if (tab === "shopee") return ["shopee"];
  if (tab === "tiktok") return ["tiktok", "manual"];
  return null;
}

/**
 * Keeps only the revenue rows and channel totals of the selected platforms, so
 * the charts and the sales table show just what the filter asks for. Business-
 * wide accounting figures (financial, inventory) are left untouched.
 */
export function filterDashboardData(data: DashboardData, platforms: Platform[]): DashboardData {
  const keep = (channel: string) => platforms.includes(platformOfChannel(channel));
  const rows = data.revenue.rows.filter((r) => keep(r.channel));
  const byChannel = Object.fromEntries(
    Object.entries(data.revenue.byChannel || {}).filter(([name]) => keep(name)),
  );
  const total = Object.values(byChannel).reduce((sum, v) => sum + v, 0);
  return { ...data, revenue: { rows, byChannel, total } };
}

/** Sales total per platform from the revenue report (TikTok, Manual). */
export function channelTotals(data?: DashboardData): Record<Exclude<Platform, "shopee">, number> {
  const out = { tiktok: 0, manual: 0 };
  Object.entries(data?.revenue.byChannel || {}).forEach(([name, amount]) => {
    const p = platformOfChannel(name);
    if (p === "tiktok" || p === "manual") out[p] += amount;
  });
  return out;
}

/** A Shopee daily sales point from the dashboard API (by transfer date). */
export interface ShopeeDailyPoint {
  date: string;
  gross_sale: number;
}

/** Every date (YYYY-MM-DD) of a YYYY-MM month. */
export function daysOfMonth(month: string): string[] {
  const [y, m] = month.split("-").map((n) => parseInt(n, 10));
  if (!y || !m) return [];
  const last = new Date(y, m, 0).getDate();
  return Array.from({ length: last }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

/**
 * Daily sales per platform for one month: TikTok and others from the revenue
 * report, Shopee from its daily series. Every day of the month is present so
 * the lines line up.
 */
export function buildDailySeries(
  month: string,
  platforms: Platform[],
  data: DashboardData | undefined,
  shopeeDaily: ShopeeDailyPoint[],
): { labels: string[]; series: Partial<Record<Platform, number[]>>; totals: Partial<Record<Platform, number>> } {
  const labels = daysOfMonth(month);
  const index = new Map(labels.map((d, i) => [d, i]));
  const series: Partial<Record<Platform, number[]>> = {};
  for (const p of platforms) series[p] = labels.map(() => 0);

  for (const r of data?.revenue.rows ?? []) {
    const p = platformOfChannel(r.channel);
    const i = index.get((r.date || "").slice(0, 10));
    if (series[p] && i !== undefined) series[p]![i] += r.amount;
  }
  if (series.shopee) {
    for (const d of shopeeDaily) {
      const i = index.get(d.date.slice(0, 10));
      if (i !== undefined) series.shopee[i] += d.gross_sale;
    }
  }

  const totals: Partial<Record<Platform, number>> = {};
  for (const p of platforms) totals[p] = (series[p] ?? []).reduce((a, b) => a + b, 0);
  return { labels, series, totals };
}

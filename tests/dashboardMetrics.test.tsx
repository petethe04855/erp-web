import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  formatThaiDay,
  formatThaiMonth,
  mergeMonthReports,
  monthlyBuckets,
  monthsOfYear,
  peakBucket,
  rankCustomers,
  summarizeOrders,
  weeklyBuckets,
  weekRangeLabel,
} from "@/features/dashboard/lib/metrics";
import { buildDailySeries } from "@/features/dashboard/lib/platforms";
import { DashboardTabs, viewFromSearch } from "@/features/dashboard/components/DashboardTabs";
import { DashboardFilterBar } from "@/features/dashboard/components/DashboardFilterBar";
import { SalesBreakdownTable } from "@/features/dashboard/components/SalesBreakdownTable";
import type { DashboardData, FinancialSummary, RevenueRow } from "@/features/dashboard/types/dashboard";

const rows: RevenueRow[] = [
  { date: "2026-11-01", reference: "TT-1", customer: "สมชาย", channel: "TikTok", amount: 1000 },
  { date: "2026-11-09", reference: "TT-2", customer: "สมชาย", channel: "TikTok", amount: 500 },
  { date: "2026-11-09", reference: "INV-1", customer: "บริษัท เอ", channel: "Manual", amount: 2000 },
  { date: "2026-11-30", reference: "INV-2", customer: " สมชาย ", channel: "Manual", amount: 100 },
  { date: "2026-11-15", reference: "TT-3", customer: "", channel: "TikTok", amount: 50 },
];

const fin = (revenue: number, cogs: number): FinancialSummary => ({
  revenue,
  cogs,
  grossProfit: revenue - cogs,
  operatingExpenses: 0,
  damageLoss: 0,
  netProfit: revenue - cogs,
  grossMargin: 0,
  netMargin: 0,
});

describe("dashboard metrics", () => {
  it("formats Thai months and days", () => {
    expect(formatThaiMonth("2026-11")).toBe("พ.ย. 2569");
    expect(formatThaiDay("2026-11-09")).toBe("9 พ.ย.");
  });

  it("counts bills by reference and only named customers", () => {
    expect(summarizeOrders(rows)).toEqual({ revenue: 3650, orders: 5, customers: 2 });
    expect(summarizeOrders([])).toEqual({ revenue: 0, orders: 0, customers: 0 });
  });

  it("ranks named customers by amount with their platforms and last purchase", () => {
    const ranked = rankCustomers(rows);
    expect(ranked.map((c) => c.name)).toEqual(["บริษัท เอ", "สมชาย"]);
    const somchai = ranked[1];
    expect(somchai.orders).toBe(3);
    expect(somchai.amount).toBe(1600);
    expect(somchai.platforms).toEqual(["tiktok", "manual"]);
    expect(somchai.mainPlatform).toBe("tiktok");
    expect(somchai.lastDate).toBe("2026-11-30");
    expect(ranked[0].share + somchai.share).toBeCloseTo(100);
  });

  it("groups a month into weeks of the month with bill counts", () => {
    const data = { revenue: { rows, total: 0, byChannel: {} } } as unknown as DashboardData;
    const { labels, series } = buildDailySeries("2026-11", ["tiktok", "manual"], data, []);
    const weeks = weeklyBuckets(labels, series, ["tiktok", "manual"], rows);
    expect(weeks.map((w) => [w.from.slice(8), w.to.slice(8)])).toEqual([
      ["01", "07"],
      ["08", "14"],
      ["15", "21"],
      ["22", "28"],
      ["29", "30"],
    ]);
    expect(weeks[0].totals).toEqual({ tiktok: 1000, manual: 0 });
    expect(weeks[1]).toMatchObject({ label: "สัปดาห์ 2", range: "8–14 พ.ย.", total: 2500, orders: 2 });
    expect(weeks[4].orders).toBe(1);
    expect(peakBucket(weeks)?.key).toBe(2);
    expect(weekRangeLabel(weeks[4])).toBe("29–30 พ.ย.");
  });

  it("has no peak when nothing sold", () => {
    expect(
      peakBucket([{ key: 1, label: "", range: "", from: "a", to: "b", totals: {}, total: 0, orders: 0 }]),
    ).toBeNull();
  });
});

describe("year view", () => {
  it("lists the months of a year up to the current month", () => {
    expect(monthsOfYear(2025, "2026-11")).toHaveLength(12);
    expect(monthsOfYear(2026, "2026-03")).toEqual(["2026-01", "2026-02", "2026-03"]);
    expect(monthsOfYear(2027, "2026-11")).toEqual([]);
  });

  it("adds months together and recomputes the margins", () => {
    const merged = mergeMonthReports([
      { revenue: { rows: [rows[0]], total: 1000, byChannel: { TikTok: 1000 } }, financial: fin(1000, 600) },
      { revenue: { rows: [rows[2]], total: 2000, byChannel: { TikTok: 500, Manual: 1500 } }, financial: fin(3000, 600) },
    ]);
    expect(merged.revenue.rows).toHaveLength(2);
    expect(merged.revenue.total).toBe(3000);
    expect(merged.revenue.byChannel).toEqual({ TikTok: 1500, Manual: 1500 });
    expect(merged.financial.revenue).toBe(4000);
    expect(merged.financial.grossProfit).toBe(2800);
    expect(merged.financial.grossMargin).toBeCloseTo(70);
  });

  it("buckets a year by month with Shopee from its monthly trend", () => {
    const yearRows: RevenueRow[] = [
      { date: "2026-01-05", reference: "TT-1", customer: "A", channel: "TikTok", amount: 100 },
      { date: "2026-01-20", reference: "INV-1", customer: "B", channel: "Manual", amount: 50 },
      { date: "2026-03-02", reference: "TT-2", customer: "A", channel: "TikTok", amount: 400 },
    ];
    const months = monthsOfYear(2026, "2026-03");
    const buckets = monthlyBuckets(months, ["tiktok", "shopee"], yearRows, [{ month: "2026-02", gross_sale: 300 }]);
    expect(buckets.map((b) => b.label)).toEqual(["ม.ค.", "ก.พ.", "มี.ค."]);
    expect(buckets[0]).toMatchObject({ totals: { tiktok: 100, shopee: 0 }, total: 100, orders: 1, to: "2026-01-31" });
    expect(buckets[1]).toMatchObject({ totals: { tiktok: 0, shopee: 300 }, total: 300, orders: 0, to: "2026-02-28" });
    expect(peakBucket(buckets)?.key).toBe(3);
  });
});

describe("DashboardTabs", () => {
  it("reads the view from the URL", () => {
    expect(viewFromSearch("?view=customers")).toBe("customers");
    expect(viewFromSearch("?view=bogus")).toBeNull();
    expect(viewFromSearch("")).toBeNull();
  });

  it("selects a tab on click and with the arrow keys", () => {
    const onChange = vi.fn();
    render(<DashboardTabs value="sales" onChange={onChange} />);
    expect(screen.getByRole("tab", { name: /ยอดขาย/ })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: /ลูกค้า/ }));
    expect(onChange).toHaveBeenLastCalledWith("customers");
    fireEvent.keyDown(screen.getByRole("tab", { name: /ยอดขาย/ }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith("profit");
  });
});

describe("DashboardFilterBar", () => {
  const base = {
    month: "2026-11",
    onMonthChange: vi.fn(),
    year: 2026,
    currentYear: 2026,
    onYearChange: vi.fn(),
    isCurrentPeriod: true,
    onCurrentPeriod: vi.fn(),
    platforms: ["tiktok" as const],
    onPlatformsChange: vi.fn(),
    stats: { orders: 3, revenue: 1000, customers: 2, loading: false },
  };

  it("switches between month and year view", () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <DashboardFilterBar {...base} mode="month" onModeChange={onModeChange} onShift={vi.fn()} />,
    );
    expect(screen.getByLabelText("เลือกเดือน")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "รายปี" }));
    expect(onModeChange).toHaveBeenLastCalledWith("year");

    rerender(<DashboardFilterBar {...base} mode="year" onModeChange={onModeChange} onShift={vi.fn()} />);
    expect(screen.getByLabelText("เลือกปี")).toHaveValue("2026");
    expect(screen.getByRole("button", { name: "ปีถัดไป" })).toBeDisabled();
  });

  it("picks a year from the list", () => {
    const onYearChange = vi.fn();
    render(
      <DashboardFilterBar {...base} onYearChange={onYearChange} mode="year" onModeChange={vi.fn()} onShift={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText("เลือกปี"), { target: { value: "2025" } });
    expect(onYearChange).toHaveBeenLastCalledWith(2025);
  });
});

describe("SalesBreakdownTable", () => {
  it("marks the peak and totals the period", () => {
    render(
      <SalesBreakdownTable
        title="ตาราง"
        description=""
        unit="สัปดาห์"
        totalLabel="รวมทั้งเดือน"
        platforms={["shopee"]}
        peakKey={2}
        showOrders={false}
        buckets={[
          { key: 1, label: "สัปดาห์ 1", range: "1–7 พ.ย.", from: "2026-11-01", to: "2026-11-07", totals: { shopee: 100 }, total: 100, orders: 0 },
          { key: 2, label: "สัปดาห์ 2", range: "8–14 พ.ย.", from: "2026-11-08", to: "2026-11-14", totals: { shopee: 300 }, total: 300, orders: 0 },
        ]}
      />,
    );
    expect(screen.getByText("สูงสุด")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getAllByText("400")).toHaveLength(2);
    expect(screen.queryByText(/บิล/)).not.toBeInTheDocument();
  });
});

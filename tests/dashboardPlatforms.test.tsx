import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlatformFilter } from "@/features/dashboard/components/PlatformFilter";
import { PlatformSalesSummary } from "@/features/dashboard/components/PlatformSalesSummary";
import {
  buildDailySeries,
  daysOfMonth,
  channelTotals,
  filterDashboardData,
  platformsFromSearch,
} from "@/features/dashboard/lib/platforms";
import type { DashboardData } from "@/features/dashboard/types/dashboard";

const data = {
  revenue: {
    total: 1500,
    byChannel: { TikTok: 1000, Manual: 500 },
    rows: [
      { date: "2026-11-01", reference: "TT-1", customer: "A", channel: "TikTok", amount: 1000 },
      { date: "2026-11-02", reference: "INV-1", customer: "B", channel: "Manual", amount: 500 },
    ],
  },
  financial: {} as DashboardData["financial"],
  inventory: { totalQty: 0, totalValue: 0, rows: [] },
} as DashboardData;

describe("dashboard platform helpers", () => {
  it("keeps only the selected platforms' rows and totals", () => {
    const tiktokOnly = filterDashboardData(data, ["tiktok", "shopee"]);
    expect(tiktokOnly.revenue.rows.map((r) => r.reference)).toEqual(["TT-1"]);
    expect(tiktokOnly.revenue.byChannel).toEqual({ TikTok: 1000 });
    expect(tiktokOnly.revenue.total).toBe(1000);
    expect(tiktokOnly.financial).toBe(data.financial);
  });

  it("sums channel totals per platform", () => {
    expect(channelTotals(data)).toEqual({ tiktok: 1000, manual: 500 });
    expect(channelTotals(undefined)).toEqual({ tiktok: 0, manual: 0 });
  });

  it("reads platforms from the URL, including the legacy tab param", () => {
    expect(platformsFromSearch("?platform=shopee,manual")).toEqual(["shopee", "manual"]);
    expect(platformsFromSearch("?platform=bogus")).toBeNull();
    expect(platformsFromSearch("?tab=shopee")).toEqual(["shopee"]);
    expect(platformsFromSearch("?tab=tiktok")).toEqual(["tiktok", "manual"]);
    expect(platformsFromSearch("")).toBeNull();
  });
});

describe("daily series per platform", () => {
  it("covers every day of the month", () => {
    expect(daysOfMonth("2026-02")).toHaveLength(28);
    expect(daysOfMonth("2026-11")[29]).toBe("2026-11-30");
  });

  it("puts TikTok, Shopee and others on their own line by day", () => {
    const { labels, series, totals } = buildDailySeries(
      "2026-11",
      ["tiktok", "shopee", "manual"],
      data,
      [
        { date: "2026-11-02", gross_sale: 300 },
        { date: "2026-10-31", gross_sale: 999 }, // outside the month: ignored
      ],
    );
    expect(labels).toHaveLength(30);
    expect(series.tiktok?.[0]).toBe(1000);
    expect(series.manual?.[1]).toBe(500);
    expect(series.shopee?.[1]).toBe(300);
    expect(totals).toEqual({ tiktok: 1000, shopee: 300, manual: 500 });
  });

  it("only builds lines for the selected platforms", () => {
    const { series, totals } = buildDailySeries("2026-11", ["shopee"], data, []);
    expect(Object.keys(series)).toEqual(["shopee"]);
    expect(totals).toEqual({ shopee: 0 });
  });
});

describe("PlatformFilter", () => {
  it("toggles a platform off and back on in a fixed order", () => {
    const onChange = vi.fn();
    const { rerender } = render(<PlatformFilter value={["tiktok", "shopee", "manual"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Shopee/ }));
    expect(onChange).toHaveBeenLastCalledWith(["tiktok", "manual"]);

    rerender(<PlatformFilter value={["manual"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /TikTok/ }));
    expect(onChange).toHaveBeenLastCalledWith(["tiktok", "manual"]);
  });

  it("keeps at least one platform selected and 'ทั้งหมด' selects all", () => {
    const onChange = vi.fn();
    render(<PlatformFilter value={["shopee"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Shopee/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "ทั้งหมด" }));
    expect(onChange).toHaveBeenLastCalledWith(["tiktok", "shopee", "manual"]);
  });
});

describe("PlatformSalesSummary", () => {
  it("shows only the selected platforms and their combined total", () => {
    render(
      <PlatformSalesSummary
        platforms={["tiktok", "shopee"]}
        totals={{ tiktok: 1000, shopee: 3000, manual: 500 }}
        loading={{}}
        notes={{ tiktok: "t", shopee: "s", manual: "m" }}
      />,
    );
    expect(screen.getByText("ยอดขายรวม 2 แพลตฟอร์ม")).toBeInTheDocument();
    expect(screen.getByText(/4,000/)).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.queryByText("อื่นๆ (Manual)")).not.toBeInTheDocument();
  });
});

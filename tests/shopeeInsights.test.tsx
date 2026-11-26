import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  monthLabel,
  presetRange,
  rangeFromSearch,
  rangeLabel,
  summarySentence,
} from "@/features/shopee-insights/lib/format";
import { journeyRank, layoutSankey } from "@/features/shopee-insights/lib/sankey";
import { journeyColor, setColor } from "@/features/shopee-insights/lib/colors";
import type { InsightKPI, InsightJourneyLink } from "@/features/shopee-insights/types";

// Charts need a canvas; the page test checks the sections and numbers, not pixels.
vi.mock("react-chartjs-2", () => ({
  Line: (p: { "aria-label"?: string }) => <div role="img" aria-label={p["aria-label"]} />,
  Chart: (p: { "aria-label"?: string }) => <div role="img" aria-label={p["aria-label"]} />,
}));

const kpi: InsightKPI = {
  total_sales: 236787,
  orders: 643,
  customers: 412,
  aov: 368.25,
  repeat_customers: 99,
  repeat_pct: 24.03,
  repeat_sales_pct: 59.0,
  median_gap_days: 32,
  last_month: "2026-10",
  prev_month: "2026-09",
  last_sales: 44034,
  prev_sales: 46845,
  mom_pct: -6.0,
};

describe("insight formatting", () => {
  it("labels months and ranges like the spec", () => {
    expect(monthLabel("2026-10")).toBe("ต.ค. 2026");
    expect(rangeLabel({ from: "2026-01", to: "2026-10" })).toBe("ม.ค.–ต.ค. 2026");
    expect(rangeLabel({ from: "2025-11", to: "2026-02" })).toBe("พ.ย. 2025–ก.พ. 2026");
  });

  it("builds the header sentence with the direction of change", () => {
    const s = summarySentence(kpi)!;
    expect(s.lead).toBe("เดือน ต.ค. 2026 ขายได้ 44,034 บาท");
    expect(s.trend).toBe("down");
    expect(s.change).toBe("ลดลง 6.0% จากเดือนก่อน");
    expect(s.tail).toBe("ลูกค้าที่ซื้อซ้ำมี 24.0% ของลูกค้าทั้งหมด ทำยอดได้ 59.0% ของยอดขาย");
    expect(summarySentence({ ...kpi, mom_pct: null })!.change).toBeNull();
    expect(summarySentence({ ...kpi, last_month: "" })).toBeNull();
  });

  it("computes preset ranges and reads the URL", () => {
    const today = new Date(2026, 10, 25);
    expect(presetRange("ytd", today)).toEqual({ from: "2026-01", to: "2026-11" });
    expect(presetRange("3m", today)).toEqual({ from: "2026-09", to: "2026-11" });
    expect(presetRange("12m", today)).toEqual({ from: "2025-12", to: "2026-11" });
    expect(presetRange("last-year", today)).toEqual({ from: "2025-01", to: "2025-12" });
    expect(rangeFromSearch("?from=2026-01&to=2026-10", today)).toEqual({ from: "2026-01", to: "2026-10" });
    expect(rangeFromSearch("?from=2026-10&to=2026-01", today)).toEqual({ from: "2026-01", to: "2026-11" });
  });

  it("keeps the set-size colours the same in the set chart and the Sankey", () => {
    expect(journeyColor("ฟรีซดราย 3 ถุง")).toBe(setColor(3));
    expect(journeyColor("ฟรีซดราย 10 ถุง")).toBe(setColor(10));
    expect(journeyColor("ยังไม่ซื้อต่อ")).not.toBe(setColor(3));
  });
});

const links: InsightJourneyLink[] = [
  { from_order: 1, from: "ฟรีซดราย 3 ถุง", to_order: 2, to: "ฟรีซดราย 3 ถุง", customers: 30 },
  { from_order: 1, from: "ฟรีซดราย 3 ถุง", to_order: 2, to: "ยังไม่ซื้อต่อ", customers: 70 },
  { from_order: 1, from: "ไม้ตกแมว", to_order: 2, to: "ยังไม่ซื้อต่อ", customers: 20 },
  { from_order: 2, from: "ฟรีซดราย 3 ถุง", to_order: 3, to: "ยังไม่ซื้อต่อ", customers: 30 },
];

describe("Sankey layout", () => {
  it("sizes nodes by customers, stacks them in rank order and keeps bands inside their nodes", () => {
    const l = layoutSankey(links, { width: 600, height: 300, nodeWidth: 10, gap: 10, rank: journeyRank });
    expect(l.columns).toBe(3);
    const node = (id: string) => l.nodes.find((n) => n.id === id)!;
    expect(node("1:ฟรีซดราย 3 ถุง").value).toBe(100);
    expect(node("1:ไม้ตกแมว").value).toBe(20);
    expect(node("2:ยังไม่ซื้อต่อ").value).toBe(90);
    expect(node("1:ไม้ตกแมว").y).toBeGreaterThan(node("1:ฟรีซดราย 3 ถุง").y);
    expect(node("3:ยังไม่ซื้อต่อ").x).toBe(590);
    for (const b of l.links) {
      expect(b.y0).toBeGreaterThanOrEqual(b.source.y - 0.001);
      expect(b.y0 + b.width).toBeLessThanOrEqual(b.source.y + b.source.height + 0.001);
      expect(b.y1 + b.width).toBeLessThanOrEqual(b.target.y + b.target.height + 0.001);
    }
  });

  it("is empty without links", () => {
    expect(layoutSankey([], { width: 600, height: 300, nodeWidth: 10, gap: 10, rank: journeyRank }).nodes).toEqual([]);
  });
});

vi.mock("@/features/shopee-insights/api", () => {
  const meta = { from: "2026-01", to: "2026-10", orders_scanned: 643, unnamed_orders: 0, excluded_orders: 5, generated_at: "" };
  const ok = <T,>(data: T) => ({ data, isPending: false, isError: false, error: null, refetch: vi.fn() });
  return {
    useInsightSummary: () =>
      ok({ meta, kpi: { total_sales: 236787, orders: 643, customers: 412, aov: 368.25, repeat_customers: 99, repeat_pct: 24.03, repeat_sales_pct: 59, median_gap_days: 32, last_month: "2026-10", prev_month: "2026-09", last_sales: 44034, prev_sales: 46845, mom_pct: -6 }, monthly: [{ month: "2026-10", sales: 44034, orders: 120, new_customers: 70, repeat_orders: 50 }] }),
    useInsightProducts: () =>
      ok({ meta, categories: ["ฟรีซดรายโปรผสม", "ฟรีซดรายชนิดเดี่ยว", "ของเล่นแมว", "อื่นๆ"], monthly_category: [], products: [{ category: "ฟรีซดรายโปรผสม", product: "[โปร 3 ถุง] ฟรีซดราย", sku: "FD-MX-03", orders: 269, qty: 286, sales: 89281 }, { category: "ของเล่นแมว", product: "ไม้ตกแมว", sku: "", orders: 10, qty: 10, sales: 590 }] }),
    useInsightSets: () =>
      ok({ meta, set_sizes: [1, 3, 5, 10], monthly_sets: [], bags_per_order: [{ bags: "3", orders: 269, sales: 89281 }], unresolved_lines: 2 }),
    useInsightCustomers: () =>
      ok({ meta, frequency: [{ purchases: 1, customers: 313, sales: 1 }], repeat_gap: { median_days: 32, weeks: [{ week: "1", customers: 5, cum_pct: 5 }] } }),
    useInsightJourney: () => ok({ meta, steps: 4, nodes: [], links: [] }),
  };
});

import { ShopeeInsights } from "@/features/shopee-insights/components/ShopeeInsights";

describe("ShopeeInsights page", () => {
  it("shows the spec's sections, KPIs and header sentence", () => {
    render(<ShopeeInsights />);
    expect(screen.getByRole("heading", { name: "Chawy ยอดขายภาพรวม" })).toBeInTheDocument();
    expect(screen.getByText("ลดลง 6.0% จากเดือนก่อน")).toBeInTheDocument();
    expect(screen.getByText("฿236,787")).toBeInTheDocument();
    expect(screen.getByText("643")).toBeInTheDocument();
    expect(screen.getByText("412 คน")).toBeInTheDocument();
    expect(screen.getByText("32 วัน")).toBeInTheDocument();
    for (const title of [
      "ยอดขายและออเดอร์รายเดือน",
      "ยอดขายรายเดือนตามหมวดสินค้า",
      "ฟรีซดรายตามขนาดเซต",
      "สินค้าเรียงตามยอดขาย",
      "ถุงฟรีซดรายต่อออเดอร์",
      "ลูกค้าตามจำนวนครั้งที่ซื้อ",
      "ระยะเวลาก่อนกลับมาซื้อครั้งที่ 2",
      "เส้นทางการซื้อครั้งที่ 1 ถึง 4",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByText("วิธีนับตัวเลข")).toBeInTheDocument();
    expect(screen.getByText(/ไม่นับออเดอร์ร้านแม่เพิ่ม 5 ออเดอร์/)).toBeInTheDocument();
    expect(screen.getByText(/2 บรรทัดอ่านขนาดเซตไม่ได้/)).toBeInTheDocument();
  });

  it("toggles set sizes but keeps at least one", () => {
    render(<ShopeeInsights />);
    const btn = (n: number) => screen.getByRole("button", { name: `${n} ถุง` });
    fireEvent.click(btn(1));
    expect(btn(1)).toHaveAttribute("aria-pressed", "false");
    for (const n of [3, 5, 10]) fireEvent.click(btn(n));
    expect(btn(10)).toHaveAttribute("aria-pressed", "true");
  });

  it("filters the product table", () => {
    render(<ShopeeInsights />);
    fireEvent.change(screen.getByLabelText("ค้นหาสินค้า"), { target: { value: "ไม้ตก" } });
    expect(screen.queryByText("[โปร 3 ถุง] ฟรีซดราย")).not.toBeInTheDocument();
    expect(screen.getAllByText("ไม้ตกแมว").length).toBeGreaterThan(0);
  });
});

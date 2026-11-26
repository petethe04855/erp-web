import { describe, expect, it } from "vitest";
import { bestSetBreakdown, cashResult, previewBill, setLabel, suggestCash } from "@/features/booth/lib/pricing";
import type { BoothConfig } from "@/features/booth/types/booth";

const config: BoothConfig = {
  warehouseId: 1,
  flavors: [
    { skuId: 11, name: "ไก่", color: "#D71920" },
    { skuId: 12, name: "ทูน่า", color: "#0047B8" },
  ],
  sets: [
    { size: 1, price: 129 },
    { size: 3, price: 289 },
    { size: 5, price: 459 },
    { size: 10, price: 890 },
  ],
  items: [{ skuId: 21, name: "ไม้ตกแมว", price: 199 }],
  discount: { enabled: true, min: 1000, type: "baht", value: 50 },
};

describe("booth pricing preview (same cases as the Go pricing tests)", () => {
  it.each([
    [1, 129, "เซต 1"],
    [2, 258, "เซต 1 ×2"],
    [4, 418, "เซต 3 + เซต 1"],
    [6, 578, "เซต 3 ×2"],
    [8, 748, "เซต 5 + เซต 3"],
    [13, 1179, "เซต 10 + เซต 3"],
  ])("%i bags cost %i", (bags, total, label) => {
    const r = bestSetBreakdown(bags, config.sets);
    expect(r.total).toBe(total);
    expect(setLabel(r.parts)).toBe(label);
  });

  it("needs a set of 1", () => {
    expect(() => bestSetBreakdown(2, [{ size: 3, price: 289 }])).toThrow();
  });

  it("adds items and the minimum-spend discount", () => {
    const bill = previewBill({ 11: 3, 12: 2, 21: 3 }, config);
    expect(bill.bags).toBe(5);
    expect(bill.treatTotal).toBe(459);
    expect(bill.subtotal).toBe(1056);
    expect(bill.discount).toBe(50);
    expect(bill.total).toBe(1006);
    expect(bill.toDiscount).toBe(0);
  });

  it("shows how much is left to reach the discount", () => {
    const bill = previewBill({ 11: 1 }, config);
    expect(bill.toDiscount).toBe(871);
    expect(bill.isEmpty).toBe(false);
    expect(previewBill({}, config).isEmpty).toBe(true);
  });

  it("suggests cash and change", () => {
    expect(suggestCash(418)).toEqual([418, 420, 500, 1000]);
    expect(cashResult(418, 500)).toEqual({ received: 500, change: 82, short: 0 });
    expect(cashResult(418, null).short).toBe(0);
    expect(cashResult(418, 400).short).toBe(18);
  });
});

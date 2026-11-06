import { describe, it, expect, beforeEach } from "vitest";
import {
  splitVatInclusive,
  DEFAULT_VAT_RATE,
  getCachedVatRate,
  setCachedVatRate,
} from "@/features/settings/hooks/useVatRate";

describe("splitVatInclusive", () => {
  beforeEach(() => {
    setCachedVatRate(null);
  });

  it("splits a VAT-inclusive total at the default 7%", () => {
    const { beforeVat, vat } = splitVatInclusive(1070);
    expect(beforeVat).toBeCloseTo(1000, 6);
    expect(vat).toBeCloseTo(70, 6);
  });

  it("splits with an explicit rate (e.g. 10%)", () => {
    const { beforeVat, vat } = splitVatInclusive(1100, 10);
    expect(beforeVat).toBeCloseTo(1000, 6);
    expect(vat).toBeCloseTo(100, 6);
  });

  it("returns the total unchanged when rate is 0", () => {
    const { beforeVat, vat } = splitVatInclusive(500, 0);
    expect(beforeVat).toBe(500);
    expect(vat).toBe(0);
  });

  it("handles a zero total", () => {
    const { beforeVat, vat } = splitVatInclusive(0, 7);
    expect(beforeVat).toBe(0);
    expect(vat).toBeCloseTo(0, 6);
  });

  it("is pure: uses the explicit rate, not the cached one", () => {
    setCachedVatRate(10);
    // splitVatInclusive is pure: with no explicit rate it uses the 7% default,
    // never the cached 10%.
    const { beforeVat } = splitVatInclusive(107);
    expect(beforeVat).toBeCloseTo(100, 6);
    expect(getCachedVatRate()).toBe(10);
  });

  it("exposes the default rate of 7 percent", () => {
    expect(DEFAULT_VAT_RATE).toBe(7);
    expect(getCachedVatRate()).toBe(7);
  });
});

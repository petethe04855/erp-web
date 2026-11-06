import { describe, it, expect } from "vitest";

describe("Live & Content Utility Calculations", () => {
  it("calculates net duration correctly with break", () => {
    const start = new Date("2026-09-12T20:00:00Z").getTime();
    const end = new Date("2026-09-12T23:15:00Z").getTime();
    const breakMinutes = 15;

    const diffMinutes = Math.round((end - start) / 60000);
    const netMinutes = Math.max(0, diffMinutes - breakMinutes);

    expect(netMinutes).toBe(180); // 3 hours
  });

  it("handles cross-midnight duration correctly", () => {
    const start = new Date("2026-09-12T23:00:00Z").getTime();
    let end = new Date("2026-09-12T02:00:00Z").getTime();
    if (end < start) {
      end += 24 * 60 * 60 * 1000;
    }
    const breakMinutes = 10;

    const diffMinutes = Math.round((end - start) / 60000);
    const netMinutes = Math.max(0, diffMinutes - breakMinutes);

    expect(netMinutes).toBe(170); // 180 - 10 = 170 mins
  });

  it("applies quarter_up (UP15) rounding policy", () => {
    const roundQuarterUp = (mins: number) => Math.ceil(mins / 15) * 15;
    expect(roundQuarterUp(42)).toBe(45);
    expect(roundQuarterUp(45)).toBe(45);
    expect(roundQuarterUp(46)).toBe(60);
  });
});

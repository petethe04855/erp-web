import { describe, expect, it } from "vitest";
import {
  addVoid,
  bangkokDay,
  bangkokHour,
  EMPTY_QUEUE,
  enqueue,
  loadQueue,
  markFailed,
  pendingBySku,
  removeBatch,
  removeVoid,
  saveQueue,
  sendable,
} from "@/features/stockout/lib/queue";
import { displayBoxes } from "@/features/stockout/components/CountView";
import { historyColumns, toCsv } from "@/features/stockout/components/HistoryView";
import type { StockOutBox, StockOutSummary } from "@/features/stockout/types/stockout";

const batch = (clientId: string, createdAt: string, lines: { skuId: number; qty: number }[]) => ({ clientId, createdAt, userId: 1, lines });

describe("stock-out offline queue", () => {
  it("keeps five offline rounds once each, in order", () => {
    let q = EMPTY_QUEUE;
    for (const id of ["a", "b", "c", "d", "e"]) q = enqueue(q, batch(id, "2026-11-26T03:00:00Z", [{ skuId: 1, qty: 1 }]));
    q = enqueue(q, batch("a", "2026-11-26T03:00:00Z", [{ skuId: 1, qty: 1 }]));
    expect(sendable(q).map((b) => b.clientId)).toEqual(["a", "b", "c", "d", "e"]);
    q = removeBatch(q, "a");
    expect(sendable(q)).toHaveLength(4);
  });

  it("stops resending a refused round but keeps it to show", () => {
    let q = enqueue(EMPTY_QUEUE, batch("x", "2026-11-26T03:00:00Z", [{ skuId: 1, qty: 1 }]));
    q = markFailed(q, "x", "SKU not found");
    expect(sendable(q)).toHaveLength(0);
    expect(q.batches[0].error).toBe("SKU not found");
  });

  it("remembers voids until they reach the server", () => {
    let q = addVoid(EMPTY_QUEUE, 7);
    q = addVoid(q, 7);
    expect(q.voids).toEqual([7]);
    expect(removeVoid(q, 7).voids).toEqual([]);
  });

  it("splits days and hours by Bangkok time", () => {
    // 23:50 Bangkok on the 26th is 16:50 UTC
    expect(bangkokDay(new Date("2026-11-26T16:50:00Z"))).toBe("2026-11-26");
    expect(bangkokDay(new Date("2026-11-26T17:10:00Z"))).toBe("2026-11-27");
    expect(bangkokHour(new Date("2026-11-26T16:50:00Z"))).toBe(23);
  });

  it("adds unsent rounds of the day to the tiles", () => {
    const q = enqueue(enqueue(EMPTY_QUEUE, batch("a", "2026-11-26T03:00:00Z", [{ skuId: 11, qty: 3 }])), batch("b", "2026-11-25T03:00:00Z", [{ skuId: 11, qty: 9 }]));
    const pending = pendingBySku(q, "2026-11-26");
    expect(pending).toEqual({ 11: 3 });
    const summary = {
      date: "2026-11-26", warehouseId: 1, pendingReview: 0, asOf: "",
      boxes: [{ skuId: 11, name: "ไก่", kind: "flavor", group: "", unit: "ถุง", color: "#D71920", image: "", lowStock: 20, skuCode: "TRT", outToday: 42, onHand: 22, low: false, lot: null }],
    } as StockOutSummary;
    const [box] = displayBoxes(summary, pending);
    expect(box.outShown).toBe(45);
    expect(box.onHandShown).toBe(19);
    expect(box.lowShown).toBe(true);
  });

  it("survives a broken storage", () => {
    expect(saveQueue(EMPTY_QUEUE)).toBe(true);
    localStorage.setItem("chawy_stockout_queue_v1", "{not json");
    expect(loadQueue()).toEqual(EMPTY_QUEUE);
  });
});

describe("stock-out history", () => {
  const boxes: StockOutBox[] = [
    { skuId: 11, name: "ไก่", kind: "flavor", group: "", unit: "ถุง", color: "#D71920", image: "", lowStock: 0 },
    { skuId: 41, name: "น้องปลา", kind: "item", group: "หัวไม้ตกแมว", unit: "ชิ้น", color: "", image: "", lowStock: 0 },
    { skuId: 42, name: "นกน้อย", kind: "item", group: "หัวไม้ตกแมว", unit: "ชิ้น", color: "", image: "", lowStock: 0 },
  ];

  it("shows wand heads per design or combined", () => {
    expect(historyColumns(boxes, false).map((c) => c.name)).toEqual(["ไก่", "น้องปลา", "นกน้อย"]);
    const combined = historyColumns(boxes, true);
    expect(combined.map((c) => c.name)).toEqual(["ไก่", "หัวไม้ตกแมว (รวม)"]);
    expect(combined[1].skus).toEqual([41, 42]);
  });

  it("writes CSV with a BOM for Excel", () => {
    const csv = toCsv([["วันที่", "ไก่"], ["2026-11-26", 3], ["a,b", 'x"y']]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"a,b","x""y"');
  });
});

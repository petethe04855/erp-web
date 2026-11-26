import { describe, expect, it } from "vitest";
import { parseSSE } from "@/features/stockout/hooks/useStockOutStream";

describe("stock-out live stream parser", () => {
  it("reads change events and skips comments and pings", () => {
    const { events, rest } = parseSSE(
      'retry: 5000\n: connected\n\n: ping\n\nevent: change\ndata: {"type":"batch","batchId":3}\n\nevent: chan',
    );
    expect(events).toEqual([{ event: "change", data: '{"type":"batch","batchId":3}' }]);
    expect(rest).toBe("event: chan");
  });

  it("joins an event split across chunks", () => {
    let buf = "event: change\nda";
    let r = parseSSE(buf);
    expect(r.events).toHaveLength(0);
    buf = r.rest + 'ta: {"type":"void"}\r\n\r\n';
    r = parseSSE(buf);
    expect(r.events[0].data).toBe('{"type":"void"}');
  });
});

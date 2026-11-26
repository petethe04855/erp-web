/**
 * Price preview for the booth screen. The API prices every bill itself
 * (erp-api usecase/booth/pricing.go) and refuses a bill whose total differs
 * from the one shown, so this file only has to match it for display.
 */
import type { BoothButton, BoothCart, BoothConfig, BoothTreatPart } from "../types/booth";

export interface PreviewLine {
  skuId: number;
  name: string;
  kind: "flavor" | "item";
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface BillPreview {
  bags: number;
  flavorLines: PreviewLine[];
  itemLines: PreviewLine[];
  treatParts: BoothTreatPart[];
  treatLabel: string;
  treatTotal: number;
  itemsTotal: number;
  subtotal: number;
  discount: number;
  toDiscount: number;
  total: number;
  isEmpty: boolean;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

export function bestSetBreakdown(bags: number, sets: BoothConfig["sets"]) {
  if (bags <= 0) return { total: 0, parts: [] as BoothTreatPart[] };
  const valid = sets.filter((s) => s.size > 0 && s.price >= 0).sort((a, b) => a.size - b.size);
  if (!valid.some((s) => s.size === 1)) throw new Error("ต้องมีเซต 1 ถุงเสมอ");
  const cost = new Array<number>(bags + 1).fill(Infinity);
  const pieces = new Array<number>(bags + 1).fill(Infinity);
  const pick = new Array<number>(bags + 1).fill(-1);
  cost[0] = 0;
  pieces[0] = 0;
  for (let i = 1; i <= bags; i += 1) {
    valid.forEach((s, k) => {
      if (s.size > i) return;
      const c = cost[i - s.size] + s.price;
      const p = pieces[i - s.size] + 1;
      if (c < cost[i] - 1e-9 || (Math.abs(c - cost[i]) < 1e-9 && p < pieces[i])) {
        cost[i] = c;
        pieces[i] = p;
        pick[i] = k;
      }
    });
  }
  const counts = new Map<number, BoothTreatPart>();
  for (let i = bags; i > 0; ) {
    const s = valid[pick[i]];
    const prev = counts.get(s.size);
    counts.set(s.size, { size: s.size, unitPrice: s.price, count: (prev?.count ?? 0) + 1 });
    i -= s.size;
  }
  const parts = [...counts.values()].sort((a, b) => b.size - a.size);
  return { total: round2(cost[bags]), parts };
}

export function setLabel(parts: BoothTreatPart[]) {
  return parts.map((p) => (p.count > 1 ? `เซต ${p.size} ×${p.count}` : `เซต ${p.size}`)).join(" + ");
}

export function previewBill(cart: BoothCart, config: BoothConfig): BillPreview {
  const qty = (id: number) => Math.max(0, Math.floor(Number(cart[id]) || 0));
  const flavorLines: PreviewLine[] = config.flavors
    .map((f) => ({ skuId: f.skuId, name: f.name, kind: "flavor" as const, qty: qty(f.skuId), unitPrice: 0, amount: 0 }))
    .filter((l) => l.qty > 0);
  const bags = flavorLines.reduce((s, l) => s + l.qty, 0);
  const treat = bestSetBreakdown(bags, config.sets);
  const itemLines: PreviewLine[] = config.items
    .map((it) => ({ skuId: it.skuId, name: it.name, kind: "item" as const, qty: qty(it.skuId), unitPrice: it.price, amount: 0 }))
    .filter((l) => l.qty > 0)
    .map((l) => ({ ...l, amount: round2(l.qty * l.unitPrice) }));
  const itemsTotal = round2(itemLines.reduce((s, l) => s + l.amount, 0));
  const subtotal = round2(treat.total + itemsTotal);
  const d = config.discount;
  const reached = d.enabled && subtotal > 0 && subtotal >= d.min;
  const raw = reached ? (d.type === "percent" ? Math.round((subtotal * d.value) / 100) : d.value) : 0;
  const discount = round2(Math.min(Math.max(0, raw), subtotal));
  const toDiscount = d.enabled && subtotal > 0 && subtotal < d.min ? round2(d.min - subtotal) : 0;
  return {
    bags,
    flavorLines,
    itemLines,
    treatParts: treat.parts,
    treatLabel: setLabel(treat.parts),
    treatTotal: treat.total,
    itemsTotal,
    subtotal,
    discount,
    toDiscount,
    total: round2(subtotal - discount),
    isEmpty: bags === 0 && itemLines.length === 0,
  };
}

/** Stock left on a button once the cart is taken out. */
export function stockLeft(button: BoothButton, cart: BoothCart) {
  return button.available - (cart[button.skuId] ?? 0);
}

export const PAY_METHODS = [
  { id: "cash", label: "เงินสด" },
  { id: "transfer", label: "โอน / QR" },
  { id: "card", label: "บัตร" },
] as const;

export const payLabel = (id?: string) => PAY_METHODS.find((m) => m.id === id)?.label ?? "ไม่ระบุ";

const ceilTo = (n: number, step: number) => Math.ceil(n / step) * step;

/** Amounts a customer is likely to hand over: the exact price first, then round-ups. */
export function suggestCash(total: number) {
  if (!(total > 0)) return [];
  const list = [...new Set([total, ceilTo(total, 10), ceilTo(total, 100), ceilTo(total, 500), ceilTo(total, 1000)])].sort(
    (a, b) => a - b,
  );
  while (list.length < 4) list.push(ceilTo(list[list.length - 1] + 1, 500));
  return list.slice(0, 4);
}

/** received null means "paid the exact price". */
export function cashResult(total: number, received: number | null) {
  const got = received ?? total;
  return { received: got, change: Math.max(0, got - total), short: Math.max(0, total - got) };
}

export const baht = (n: number) => "฿" + Math.round(n).toLocaleString("th-TH");

/**
 * Offline-first queue for stock-out batches (the booth POS sync.js idea):
 * every batch is saved on the device first, sent when there is a network,
 * and remembered until the server has it. A batch voided before it was sent
 * is simply dropped; a void of a sent batch waits here until it reaches the
 * server. Pure functions, so they can be tested without a browser.
 */
export interface QueuedBatch {
  clientId: string;
  createdAt: string;
  userId: string | number | null;
  lines: { skuId: number; qty: number }[];
  /** Set when the server refused it; it is kept so the counter can see why. */
  error?: string;
}

export interface QueueState {
  batches: QueuedBatch[];
  /** Server ids of sent batches whose void has not reached the server yet. */
  voids: number[];
}

export const EMPTY_QUEUE: QueueState = { batches: [], voids: [] };
const KEY = "chawy_stockout_queue_v1";

export function enqueue(q: QueueState, b: QueuedBatch): QueueState {
  if (q.batches.some((x) => x.clientId === b.clientId)) return q;
  return { ...q, batches: [...q.batches, b] };
}

export function removeBatch(q: QueueState, clientId: string): QueueState {
  return { ...q, batches: q.batches.filter((b) => b.clientId !== clientId) };
}

export function markFailed(q: QueueState, clientId: string, error: string): QueueState {
  return { ...q, batches: q.batches.map((b) => (b.clientId === clientId ? { ...b, error } : b)) };
}

export function addVoid(q: QueueState, id: number): QueueState {
  return q.voids.includes(id) ? q : { ...q, voids: [...q.voids, id] };
}

export function removeVoid(q: QueueState, id: number): QueueState {
  return { ...q, voids: q.voids.filter((v) => v !== id) };
}

/** Batches still to send: not refused, oldest first. */
export function sendable(q: QueueState): QueuedBatch[] {
  return q.batches.filter((b) => !b.error);
}

/** What the device holds but the server does not have yet, per SKU, for one Bangkok day. */
export function pendingBySku(q: QueueState, day: string): Record<number, number> {
  const out: Record<number, number> = {};
  for (const b of q.batches) {
    if (b.error || bangkokDay(new Date(b.createdAt)) !== day) continue;
    for (const l of b.lines) out[l.skuId] = (out[l.skuId] ?? 0) + l.qty;
  }
  return out;
}

export function bangkokDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function bangkokHour(d: Date): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", hour12: false }).format(d)) % 24;
}

export function loadQueue(): QueueState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && Array.isArray(raw.batches) && Array.isArray(raw.voids)) return raw as QueueState;
  } catch {
    // storage blocked or corrupt: start empty
  }
  return EMPTY_QUEUE;
}

export function saveQueue(q: QueueState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
    return true;
  } catch {
    return false;
  }
}

export const newClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

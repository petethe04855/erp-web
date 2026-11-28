import type { InsightJourneyLink } from "../types";

export interface SankeyNode {
  id: string;
  label: string;
  column: number;
  value: number;
  x: number;
  y: number;
  height: number;
}

export interface SankeyLink {
  source: SankeyNode;
  target: SankeyNode;
  value: number;
  /** Top of the band at the source and target side. */
  y0: number;
  y1: number;
  width: number;
}

export interface SankeyLayout {
  nodes: SankeyNode[];
  links: SankeyLink[];
  columns: number;
}

interface Options {
  width: number;
  height: number;
  nodeWidth: number;
  gap: number;
  /** Node order within a column (lower first). */
  rank: (label: string) => number;
}

/**
 * Lays out a layered Sankey: column = purchase number, node height ∝ customers,
 * bands stacked in node order on both ends so they do not cross needlessly.
 */
export function layoutSankey(links: InsightJourneyLink[], o: Options): SankeyLayout {
  const nodeMap = new Map<string, SankeyNode>();
  const node = (column: number, label: string) => {
    const id = `${column}:${label}`;
    let n = nodeMap.get(id);
    if (!n) {
      n = { id, label, column, value: 0, x: 0, y: 0, height: 0 };
      nodeMap.set(id, n);
    }
    return n;
  };

  const inSum = new Map<string, number>();
  const outSum = new Map<string, number>();
  for (const l of links) {
    const s = node(l.from_order, l.from);
    const t = node(l.to_order, l.to);
    outSum.set(s.id, (outSum.get(s.id) ?? 0) + l.customers);
    inSum.set(t.id, (inSum.get(t.id) ?? 0) + l.customers);
  }
  const nodes = [...nodeMap.values()];
  for (const n of nodes) n.value = Math.max(inSum.get(n.id) ?? 0, outSum.get(n.id) ?? 0);

  const columns = nodes.reduce((m, n) => Math.max(m, n.column), 0);
  if (!columns) return { nodes: [], links: [], columns: 0 };

  const byColumn = new Map<number, SankeyNode[]>();
  for (const n of nodes) byColumn.set(n.column, [...(byColumn.get(n.column) ?? []), n]);
  for (const list of byColumn.values()) list.sort((a, b) => o.rank(a.label) - o.rank(b.label));

  // One scale for all columns, set by the fullest column.
  let scale = Infinity;
  for (const list of byColumn.values()) {
    const total = list.reduce((s, n) => s + n.value, 0);
    const space = o.height - o.gap * (list.length - 1);
    if (total > 0) scale = Math.min(scale, space / total);
  }
  if (!Number.isFinite(scale)) scale = 0;

  const step = columns > 1 ? (o.width - o.nodeWidth) / (columns - 1) : 0;
  for (const [col, list] of byColumn) {
    let y = 0;
    for (const n of list) {
      n.x = (col - 1) * step;
      n.y = y;
      n.height = Math.max(n.value * scale, 1);
      y += n.height + o.gap;
    }
  }

  const outOffset = new Map<string, number>();
  const inOffset = new Map<string, number>();
  const sorted = [...links].sort(
    (a, b) =>
      a.from_order - b.from_order || o.rank(a.from) - o.rank(b.from) || o.rank(a.to) - o.rank(b.to),
  );
  const result: SankeyLink[] = [];
  // Bands leave a node in target order and enter a node in source order.
  for (const l of sorted) {
    const source = nodeMap.get(`${l.from_order}:${l.from}`)!;
    const target = nodeMap.get(`${l.to_order}:${l.to}`)!;
    const width = l.customers * scale;
    const y0 = source.y + (outOffset.get(source.id) ?? 0);
    outOffset.set(source.id, (outOffset.get(source.id) ?? 0) + width);
    result.push({ source, target, value: l.customers, y0, y1: 0, width });
  }
  const byTarget = [...result].sort(
    (a, b) => a.target.column - b.target.column || o.rank(a.source.label) - o.rank(b.source.label),
  );
  for (const r of byTarget) {
    r.y1 = r.target.y + (inOffset.get(r.target.id) ?? 0);
    inOffset.set(r.target.id, (inOffset.get(r.target.id) ?? 0) + r.width);
  }
  return { nodes, links: result, columns };
}

/** SVG path of a band from (x0, y0) to (x1, y1), `w` thick. */
export function bandPath(x0: number, y0: number, x1: number, y1: number, w: number): string {
  const mx = (x0 + x1) / 2;
  return [
    `M${x0},${y0}`,
    `C${mx},${y0} ${mx},${y1} ${x1},${y1}`,
    `L${x1},${y1 + w}`,
    `C${mx},${y1 + w} ${mx},${y0 + w} ${x0},${y0 + w}`,
    "Z",
  ].join(" ");
}

/** Node order: freeze-dried by set size, then the rod, the rest, and "not yet". */
export function journeyRank(label: string): number {
  const m = label.match(/^ฟรีซดราย (\d+) ถุง$/);
  if (m) return parseInt(m[1], 10);
  if (label === "ไม้ตกแมว") return 1000;
  if (label === "ยังไม่ซื้อต่อ") return 1002;
  return 1001;
}

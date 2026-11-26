"use client";

import React, { useMemo, useState } from "react";
import { bandPath, journeyRank, layoutSankey } from "../lib/sankey";
import { journeyColor } from "../lib/colors";
import { num } from "../lib/format";
import type { InsightJourneyLink } from "../types";
import { ChartTable } from "./InsightCharts";

const STOP = "ยังไม่ซื้อต่อ";
const W = 880;
const H = 360;
const NODE_W = 12;
const LABEL_SPACE = 120;

/**
 * Purchase journey 1st → Nth order as a Sankey: bands coloured by the product
 * of the earlier order, grey "ยังไม่ซื้อต่อ" nodes for customers who stopped.
 */
export function JourneySankey({ links, steps }: { links: InsightJourneyLink[]; steps: number }) {
  const [hideStop, setHideStop] = useState(false);
  const shown = useMemo(() => (hideStop ? links.filter((l) => l.to !== STOP) : links), [links, hideStop]);
  const layout = useMemo(
    () => layoutSankey(shown, { width: W - LABEL_SPACE, height: H, nodeWidth: NODE_W, gap: 10, rank: journeyRank }),
    [shown],
  );
  const firstBuyers = links.filter((l) => l.from_order === 1).reduce((s, l) => s + l.customers, 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <span>
          ลูกค้า {num(firstBuyers)} คน · ครั้งที่ 1 ถึง {steps} · ความหนาของแถบ = จำนวนลูกค้า
        </span>
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={hideStop}
            onChange={(e) => setHideStop(e.target.checked)}
            className="h-3.5 w-3.5 accent-neutral-900"
          />
          ซ่อนคนที่ยังไม่ซื้อต่อ
        </label>
      </div>

      {layout.nodes.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">ยังไม่มีลูกค้าในช่วงนี้</p>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`-4 -20 ${W + 8} ${H + 28}`}
            className="min-w-[640px] w-full"
            role="img"
            aria-label={`เส้นทางการซื้อครั้งที่ 1 ถึง ${steps}`}
          >
            {Array.from({ length: layout.columns }, (_, i) => {
              const x = layout.columns > 1 ? (i * (W - LABEL_SPACE - NODE_W)) / (layout.columns - 1) : 0;
              return (
                <text key={i} x={x} y={-6} fontSize={11} fill="#737373">
                  ครั้งที่ {i + 1}
                </text>
              );
            })}
            {layout.links.map((l) => (
              <path
                key={`${l.source.id}->${l.target.id}`}
                d={bandPath(l.source.x + NODE_W, l.y0, l.target.x, l.y1, Math.max(l.width, 0.5))}
                fill={journeyColor(l.source.label)}
                fillOpacity={l.target.label === STOP ? 0.15 : 0.35}
              >
                <title>
                  {`ครั้งที่ ${l.source.column} ${l.source.label} → ครั้งที่ ${l.target.column} ${l.target.label}: ${num(l.value)} คน`}
                </title>
              </path>
            ))}
            {layout.nodes.map((n) => (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={NODE_W} height={n.height} rx={2} fill={journeyColor(n.label)}>
                  <title>{`ครั้งที่ ${n.column} · ${n.label}: ${num(n.value)} คน`}</title>
                </rect>
                {n.height >= 9 && (
                  <text x={n.x + NODE_W + 4} y={n.y + n.height / 2} dominantBaseline="middle" fontSize={11} fill="currentColor">
                    {n.label} <tspan fill="#737373">{num(n.value)}</tspan>
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}

      <ChartTable
        head={["จาก", "ไป", "ลูกค้า"]}
        rows={shown.map((l) => [`ครั้งที่ ${l.from_order} ${l.from}`, `ครั้งที่ ${l.to_order} ${l.to}`, l.customers])}
      />
    </div>
  );
}

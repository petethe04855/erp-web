"use client";

import { CircleX, Layers3, Package, TriangleAlert } from "lucide-react";

interface SkuStatsProps {
  activeCount: number;
  lowStockCount: number;
  outStockCount: number;
  bundleCount: number;
}

const stats = [
  {
    key: "all",
    label: "SKU ทั้งหมด",
    valueKey: "activeCount",
    icon: Package,
    color: "var(--erp-accent)",
  },
  {
    key: "low",
    label: "ใกล้หมด",
    valueKey: "lowStockCount",
    icon: TriangleAlert,
    color: "var(--erp-warn)",
  },
  {
    key: "out",
    label: "หมดสต็อก",
    valueKey: "outStockCount",
    icon: CircleX,
    color: "var(--erp-neg)",
  },
  {
    key: "bundle",
    label: "สินค้าเซ็ต",
    valueKey: "bundleCount",
    icon: Layers3,
    color: "var(--erp-pos)",
  },
] as const;

export default function SkuStats(props: SkuStatsProps) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.key}
            className="rounded-lg border p-4"
            style={{
              background: "var(--erp-surface)",
              borderColor: "var(--erp-border)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full opacity-60"
                    style={{ background: stat.color }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {stat.label}
                  </span>
                </div>
                <div
                  className="mt-1.5 text-2xl font-semibold tabular-nums"
                  style={{ color: "var(--erp-ink)" }}
                >
                  {props[stat.valueKey]}
                </div>
              </div>
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-md"
                style={{
                  color: "var(--erp-ink3)",
                  background: "var(--erp-subtle)",
                }}
              >
                <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

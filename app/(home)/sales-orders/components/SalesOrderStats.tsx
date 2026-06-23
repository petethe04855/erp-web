"use client";
import React from "react";
import { Card, Mono, fmtBaht, fmtNum } from "@/components/ui";
import type { DesignTokens } from "@/lib/design/tokens";

interface SalesOrderStatsProps {
  t: DesignTokens;
  totalAmount: number;
  filteredCount: number;
  itemCount: number;
  largestAmount: number;
}

export default function SalesOrderStats({
  t,
  totalAmount,
  filteredCount,
  itemCount,
  largestAmount,
}: SalesOrderStatsProps) {
  const c = t.color;
  return (
    <Card t={t} pad={false} style={{ marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          {
            label: "Selection total",
            value: fmtBaht(totalAmount),
            sub: `${filteredCount} orders`,
          },
          {
            label: "Average order",
            value: fmtBaht(filteredCount ? totalAmount / filteredCount : 0),
            sub: "per order",
          },
          {
            label: "Items shipped",
            value: fmtNum(itemCount),
            sub: "across selection",
          },
          {
            label: "Largest order",
            value: fmtBaht(largestAmount),
            sub: "in selection",
          },
        ].map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: "16px 22px",
              borderRight: i < 3 ? `1px solid ${c.border}` : "none",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: c.ink3,
              }}
            >
              {item.label}
            </div>
            <Mono
              t={t}
              size={20}
              weight={600}
              style={{ display: "block", marginTop: 8 }}
            >
              {item.value}
            </Mono>
            <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

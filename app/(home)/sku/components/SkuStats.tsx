"use client";
import React from "react";

interface SkuStatsProps {
  activeCount: number;
  lowStockCount: number;
  outStockCount: number;
  bundleCount: number;
}

export default function SkuStats({
  activeCount,
  lowStockCount,
  outStockCount,
  bundleCount,
}: SkuStatsProps) {
  const stats = [
    {
      label: "SKU ทั้งหมด",
      value: activeCount,
      icon: "SKU",
      color: "var(--erp-accent)",
      bg: "var(--erp-accent-bg)",
    },
    {
      label: "ใกล้หมด",
      value: lowStockCount,
      icon: "LOW",
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      label: "หมดสต็อก",
      value: outStockCount,
      icon: "OUT",
      color: "#EF4444",
      bg: "#FEE2E2",
    },
    {
      label: "สินค้าเซ็ต",
      value: bundleCount,
      icon: "SET",
      color: "#059669",
      bg: "#D1FAE5",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{ background: s.bg, borderRadius: 10, padding: "14px 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>
              {s.label}
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

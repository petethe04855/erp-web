"use client";
import React from "react";
import { CategoryBadge, StockBadge } from "@/components/ui";
import type { Product, BundleComponent } from "@/lib/store/erpWorkflow";

interface SkuViewModalProps {
  selected: Product;
  bundleComponents: BundleComponent[];
  products: Product[];
  calcBundleVirtualStock: (sku: string) => number;
  onClose: () => void;
  onEdit: () => void;
}

export default function SkuViewModal({
  selected,
  bundleComponents,
  products,
  calcBundleVirtualStock,
  onClose,
  onEdit,
}: SkuViewModalProps) {
  const formatBaht = (n: number) => "฿" + n.toLocaleString("th-TH");
  const comps = bundleComponents.filter((c) => c.bundleSku === selected.sku);
  const virtualQty = calcBundleVirtualStock(selected.sku);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--erp-surface)",
          borderRadius: 12,
          padding: 28,
          width: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--erp-accent)",
              }}
            >
              {selected.sku}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--erp-ink)",
                marginTop: 2,
              }}
            >
              {selected.name}
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
              <CategoryBadge type={selected.type} />
              <StockBadge
                stock={selected.stock}
                reorder={selected.reorder}
                isBundle={selected.isBundle}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#9CA3AF",
            }}
          >
            Close
          </button>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {[
            { label: "บาร์โค้ด", value: selected.barcode || "—" },
            {
              label: "น้ำหนัก",
              value: selected.weightGrams ? `${selected.weightGrams}g` : "—",
            },
            { label: "ต้นทุน", value: formatBaht(selected.cost) },
            {
              label: "Gross Margin B2C",
              value: `${(((selected.retailPrice - selected.cost) / selected.retailPrice) * 100).toFixed(1)}%`,
            },
            { label: "ราคา B2C", value: formatBaht(selected.retailPrice) },
            { label: "ราคา B2B", value: formatBaht(selected.wholesalePrice) },
            {
              label: "สต็อกปัจจุบัน",
              value: selected.isBundle
                ? "Virtual"
                : selected.stock.toLocaleString(),
            },
            {
              label: "สต็อก Reserved",
              value: selected.reservedQty.toLocaleString(),
            },
            { label: "Reorder Point", value: selected.reorder || "—" },
            {
              label: "สต็อกพร้อมขาย",
              value: selected.isBundle
                ? "Virtual"
                : (selected.stock - selected.reservedQty).toLocaleString(),
            },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                background: "var(--erp-subtle)",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--erp-ink3)",
                  marginBottom: 2,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--erp-ink)",
                }}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>

        {selected.note && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "#FFFBEB",
              borderRadius: 8,
              border: "1px solid #FDE68A",
              fontSize: 13,
              color: "#92400E",
            }}
          >
            {selected.note}
          </div>
        )}

        {selected.isBundle && (
          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              background: "#F0FDF4",
              borderRadius: 8,
              border: "1px solid #BBF7D0",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#065F46",
                marginBottom: 8,
              }}
            >
              🧩 BOM — ส่วนประกอบ
            </div>
            {comps.length === 0 ? (
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                ยังไม่ได้กำหนด BOM — กด BOM เพื่อตั้งค่า
              </div>
            ) : (
              <>
                {comps.map((c) => {
                  const cp = products.find((p) => p.sku === c.componentSku);
                  return (
                    <div
                      key={c.componentSku}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginBottom: 4,
                        color: "#374151",
                      }}
                    >
                      <span>
                        • {c.componentSku} ({cp?.name ?? "?"})
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        × {c.qty} {c.unit ?? "piece"} · ฿
                        {(c.componentType === "expense"
                          ? c.qty * (c.unitCostOverride ?? 0)
                          : c.qty * (cp?.cost ?? 0)
                        ).toLocaleString("th-TH", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #BBF7D0",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#059669",
                  }}
                >
                  สต็อกพร้อมขาย: {virtualQty} ชุด
                </div>
              </>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button
            onClick={onEdit}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid var(--erp-border)",
              background: "var(--erp-surface)",
              color: "#374151",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            แก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}

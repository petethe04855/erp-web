"use client";

import { useTheme } from "@/lib/design/ThemeContext";

export function AboutTab() {
  const { tokens: t } = useTheme();
  const c = t.color;

  const sections = [
    {
      label: "Sales",
      items: ["Quotation", "Sales Order", "Invoice", "Live Commerce", "Sampling"],
    },
    {
      label: "Inventory",
      items: [
        "Stock Balance",
        "Lot/FEFO",
        "Goods Receive",
        "Goods Issue",
        "Stock Transfer",
        "Stock Check",
      ],
    },
    {
      label: "Purchasing",
      items: ["Purchase Request", "Purchase Order", "Returns"],
    },
  ];

  return (
    <div>
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--erp-accent)] to-[var(--erp-accent)]/80 flex items-center justify-center mx-auto mb-4 text-3xl shadow-md">
          🐾
        </div>
        <div className="text-xl font-extrabold text-foreground" style={{ color: "var(--erp-ink)" }}>
          Chawy ERP
        </div>
        <div className="text-xs text-muted-foreground mt-1" style={{ color: "var(--erp-ink3)" }}>
          ระบบบริหารจัดการสำหรับธุรกิจอาหารสัตว์เลี้ยง
        </div>
        <div className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--erp-accent-subtle)", color: "var(--erp-accent)" }}>
          Version 2.1.0
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {sections.map((section) => (
          <div
            key={section.label}
            className="p-4 rounded-lg border bg-card"
            style={{ borderColor: "var(--erp-border)" }}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--erp-accent)" }}>
              {section.label}
            </div>
            <div className="flex flex-col gap-1.5">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: "var(--erp-ink2)" }}
                >
                  <span className="text-emerald-500 font-bold">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

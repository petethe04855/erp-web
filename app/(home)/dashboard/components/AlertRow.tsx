"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Mono, Dot } from "@/components/ui";

interface AlertRowProps {
  t: ReturnType<typeof useTheme>["tokens"];
  sev: "high" | "med" | "low";
  title: string;
  meta: string;
  age: string;
  divider?: boolean;
}

export function AlertRow({
  t,
  sev,
  title,
  meta,
  age,
  divider,
}: AlertRowProps) {
  const c = t.color;
  const color = sev === "high" ? c.neg : sev === "med" ? c.warn : c.ink3;
  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3.5 py-3.5 ${divider ? "border-t border-border" : ""}`}
      style={{ borderTopColor: divider ? 'var(--erp-border)' : undefined }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 76 }}
      >
        <Dot color={color} size={6} />
        <span
          style={{
            fontSize: 10,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
            fontFamily: t.font.sans,
          }}
        >
          {sev === "high" ? "Critical" : sev === "med" ? "Warning" : "Notice"}
        </span>
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            color: c.ink,
            fontWeight: 500,
            letterSpacing: "-0.005em",
            fontFamily: t.font.sans,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: c.ink3,
            marginTop: 2,
            fontFamily: t.font.sans,
          }}
        >
          {meta}
        </div>
      </div>
      <Mono t={t} size={11} color={c.ink3}>
        {age}
      </Mono>
    </div>
  );
}

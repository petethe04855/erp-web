"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Mono, fmtBaht } from "@/components/ui";

interface ChannelBarProps {
  t: ReturnType<typeof useTheme>["tokens"];
  name: string;
  rev: number;
  delta: number;
  max: number;
}

export function ChannelBar({
  t,
  name,
  rev,
  delta,
  max,
}: ChannelBarProps) {
  const c = t.color;
  const pct = max > 0 ? (rev / max) * 100 : 0;
  return (
    <div className="grid grid-cols-[130px_1fr_100px_70px] items-center gap-3.5 py-2.5">
      <div
        style={{
          fontSize: 13,
          color: c.ink,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          fontFamily: t.font.sans,
        }}
      >
        {name}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden" style={{ background: c.subtle }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: c.accent,
          }}
        />
      </div>
      <Mono t={t} size={13} weight={500}>
        {fmtBaht(rev)}
      </Mono>
      <Mono
        t={t}
        size={11}
        weight={500}
        color={delta >= 0 ? c.pos : c.neg}
        style={{ textAlign: "right" }}
      >
        {delta >= 0 ? "+" : "−"}
        {Math.abs(delta).toFixed(1)}%
      </Mono>
    </div>
  );
}

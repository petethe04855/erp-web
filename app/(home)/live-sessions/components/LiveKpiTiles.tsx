"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, fmtNum } from "@/components/ui";

interface LiveKpiTilesProps {
  totalReach: number;
  avgEng: number;
  scheduledCount: number;
  maxReach: number;
  postsCount: number;
}

export function LiveKpiTiles({
  totalReach,
  avgEng,
  scheduledCount,
  maxReach,
  postsCount,
}: LiveKpiTilesProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const tiles = [
    {
      label: "Total Reach · MTD",
      value: fmtNum(totalReach),
      sub: `${postsCount} posts`,
      primary: true,
    },
    {
      label: "Avg. Engagement",
      value: `${avgEng.toFixed(1)}%`,
      sub: "across posts",
      primary: false,
    },
    {
      label: "Scheduled Lives",
      value: scheduledCount.toString(),
      sub: "upcoming",
      primary: false,
    },
    {
      label: "Best Post Reach",
      value: fmtNum(maxReach),
      sub: "top performer",
      primary: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <Card
          t={t}
          key={tile.label}
          className="border border-border bg-card p-5"
          style={{
            borderColor: "var(--erp-border)",
            background: tile.primary ? c.subtle : "var(--erp-surface)",
          }}
        >
          <div
            className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            {tile.label}
          </div>
          <span className="block mt-2">
            <Mono t={t} size={24} weight={600}>
              {tile.value}
            </Mono>
          </span>
          <div
            className="text-xs text-muted-foreground mt-1"
            style={{ color: "var(--erp-ink3)" }}
          >
            {tile.sub}
          </div>
        </Card>
      ))}
    </div>
  );
}

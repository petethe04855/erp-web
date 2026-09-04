"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Badge } from "@/components/ui";
import { formatBaht, type LiveSession } from "@/lib/mockData";
import { dateLabel, getStaffName } from "./liveUtils";

interface ContentGapReportProps {
  contentGaps: LiveSession[];
}

export function ContentGapReport({ contentGaps }: ContentGapReportProps) {
  const { tokens: t } = useTheme();

  return (
    <Card
      t={t}
      className="border border-border bg-card p-5"
      style={{
        borderColor: "var(--erp-border)",
        background: "var(--erp-surface)",
      }}
    >
      <div
        className="text-sm font-bold text-foreground pb-4 border-b border-border"
        style={{
          borderColor: "var(--erp-border)",
          color: "var(--erp-ink)",
        }}
      >
        Content Gap Report
      </div>
      <div
        className="text-xs text-muted-foreground mt-1.5 mb-4"
        style={{ color: "var(--erp-ink3)" }}
      >
        ไลฟ์แล้วแต่ยังไม่มีคลิป
      </div>
      <div className="grid gap-3">
        {contentGaps.map((session) => {
          const statusStyle =
            session.status === "Manager_Approved"
              ? "normal"
              : session.status === "Rejected"
                ? "empty"
                : "low";
          return (
            <div
              key={session.id}
              className="border rounded-lg p-3 grid gap-1.5"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-subtle)",
              }}
            >
              <div className="flex justify-between items-center gap-2">
                <div
                  className="text-sm font-bold text-foreground"
                  style={{ color: "var(--erp-ink)" }}
                >
                  {dateLabel(session.live_date)} ·{" "}
                  {getStaffName(session.staff_id)}
                </div>
                <Badge variant={statusStyle}>{session.status}</Badge>
              </div>
              <div
                className="text-xs text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                {session.platform} · {formatBaht(session.revenue_generated)}
              </div>
            </div>
          );
        })}
        {contentGaps.length === 0 && (
          <div
            className="text-center p-6 text-sm text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            ไม่มีช่องว่าง Content
          </div>
        )}
      </div>
    </Card>
  );
}

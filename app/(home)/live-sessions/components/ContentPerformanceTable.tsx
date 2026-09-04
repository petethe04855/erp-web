"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, fmtNum } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ContentPost } from "@/lib/mockData";

interface ContentPerformanceTableProps {
  posts: ContentPost[];
  maxReach: number;
}

export function ContentPerformanceTable({
  posts,
  maxReach,
}: ContentPerformanceTableProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  return (
    <div className="grid gap-3">
      <div
        className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
        style={{ color: "var(--erp-ink3)" }}
      >
        Content Performance
      </div>
      <Card
        t={t}
        pad={false}
        className="overflow-hidden border border-border bg-card"
        style={{
          borderColor: "var(--erp-border)",
          background: "var(--erp-surface)",
        }}
      >
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader
              className="bg-muted/50 border-b border-border"
              style={{
                background: "var(--erp-subtle)",
                borderColor: "var(--erp-border)",
              }}
            >
              <TableRow>
                <TableHead
                  className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  Content
                </TableHead>
                <TableHead
                  className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  Platform
                </TableHead>
                <TableHead
                  className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  Reach
                </TableHead>
                <TableHead
                  className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  Engagement
                </TableHead>
                <TableHead
                  className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  Posted
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p, idx) => (
                <TableRow
                  key={idx}
                  className="hover:bg-muted/50 transition-colors border-b border-border"
                  style={{ borderColor: "var(--erp-border)" }}
                >
                  <TableCell
                    className="p-4 px-5 align-middle text-sm font-semibold text-foreground"
                    style={{ color: "var(--erp-ink)" }}
                  >
                    {p.title}
                  </TableCell>
                  <TableCell
                    className="p-4 px-5 align-middle text-sm text-muted-foreground"
                    style={{ color: "var(--erp-ink2)" }}
                  >
                    {p.platform}
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <div
                        className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"
                        style={{ background: "var(--erp-subtle)" }}
                      >
                        <div
                          className="h-full rounded-full bg-[var(--erp-accent)]"
                          style={{
                            width: `${maxReach > 0 ? (p.reach / maxReach) * 100 : 0}%`,
                            backgroundColor: c.accent,
                          }}
                        />
                      </div>
                      <span className="w-16 text-right">
                        <Mono t={t} size={13} weight={600}>
                          {fmtNum(p.reach)}
                        </Mono>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-right">
                    <Mono
                      t={t}
                      size={12}
                      weight={500}
                      color={p.eng >= 6 ? c.pos : c.ink2}
                    >
                      {p.eng.toFixed(1)}%
                    </Mono>
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-right">
                    <Mono t={t} size={11} color={c.ink3}>
                      {p.date}
                    </Mono>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

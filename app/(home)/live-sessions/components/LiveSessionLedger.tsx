"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Badge } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  adminUsers,
  formatBaht,
  getLiveNetMinutes,
  getRoundedLiveMinutes,
  type LiveSession,
  type RoundingPolicy,
} from "@/lib/mockData";
import { dateLabel, timeLabel, getStaffName } from "./liveUtils";

interface LiveSessionLedgerProps {
  sessions: LiveSession[];
  roundingPolicy: RoundingPolicy;
}

export function LiveSessionLedger({
  sessions,
  roundingPolicy,
}: LiveSessionLedgerProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  return (
    <Card
      t={t}
      pad={false}
      className="overflow-hidden border border-border bg-card"
      style={{
        borderColor: "var(--erp-border)",
        background: "var(--erp-surface)",
      }}
    >
      <div
        className="p-4 px-5 border-b border-border text-sm font-bold text-foreground"
        style={{
          borderColor: "var(--erp-border)",
          color: "var(--erp-ink)",
        }}
      >
        Live Session Ledger
      </div>
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
                Session
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                บัญชี
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                เวลา
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                style={{ color: "var(--erp-ink3)" }}
              >
                Net
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                style={{ color: "var(--erp-ink3)" }}
              >
                Revenue
              </TableHead>
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
                Status
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                Audit
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const minutes = getRoundedLiveMinutes(
                getLiveNetMinutes(session),
                roundingPolicy,
              );
              const statusStyle =
                session.status === "Manager_Approved"
                  ? "normal"
                  : session.status === "Rejected"
                    ? "empty"
                    : "low";
              return (
                <TableRow
                  key={session.id}
                  className="border-b border-border font-sans"
                  style={{ borderColor: "var(--erp-border)" }}
                >
                  <TableCell className="p-4 px-5 align-middle">
                    <div
                      className="font-mono text-sm font-bold text-[var(--erp-accent)]"
                      style={{ color: c.accent }}
                    >
                      {session.id}
                    </div>
                    <div
                      className="text-xs text-muted-foreground mt-1"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      {getStaffName(session.staff_id)} ·{" "}
                      {dateLabel(session.live_date)}
                    </div>
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-sm text-foreground">
                    {session.tiktok_account}
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-sm text-foreground">
                    {timeLabel(session.start_datetime)} -{" "}
                    {timeLabel(session.end_datetime)}
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-right text-sm font-bold">
                    {minutes}m
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-right text-sm font-bold">
                    {formatBaht(session.revenue_generated)}
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-xs text-muted-foreground">
                    {session.has_clip ? "Clip" : "No clip"} ·{" "}
                    {session.live_summary_image ? "Image" : "No image"}
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle">
                    <Badge variant={statusStyle}>{session.status}</Badge>
                  </TableCell>
                  <TableCell
                    className="p-4 px-5 align-middle text-xs text-muted-foreground"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    <div>
                      {adminUsers.find((a) => a.id === session.approved_by)
                        ?.name ?? session.updatedBy}
                    </div>
                    <div className="mt-1">{session.updatedAt}</div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

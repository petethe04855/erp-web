"use client";

import { Check, CheckSquare, Square, Video, X } from "lucide-react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  formatBaht,
  getLiveDecimalHours,
  getLiveNetMinutes,
  getRoundedLiveMinutes,
  type LiveSession,
  type RoundingPolicy,
} from "@/lib/mockData";
import { dateLabel, timeLabel, getStaffName } from "./liveUtils";

interface LiveReviewQueueProps {
  pendingSessions: LiveSession[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onApprove: (ids: string[]) => void;
  onReject: (id: string) => void;
  onOpenCheckout: () => void;
  roundingPolicy: RoundingPolicy;
}

export function LiveReviewQueue({
  pendingSessions,
  selectedIds,
  onToggleSelect,
  onApprove,
  onReject,
  onOpenCheckout,
  roundingPolicy,
}: LiveReviewQueueProps) {
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
        className="p-4 px-5 border-b border-border flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: "var(--erp-border)" }}
      >
        <div>
          <div
            className="text-sm font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            Control Tower · Review Queue
          </div>
          <div
            className="text-xs text-muted-foreground mt-1"
            style={{ color: "var(--erp-ink3)" }}
          >
            {pendingSessions.length} รายการรอตรวจ
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onOpenCheckout}
            className="cursor-pointer gap-1.5"
          >
            <Video className="size-4" /> Log Session
          </Button>
          <Button
            disabled={selectedIds.length === 0}
            onClick={() => onApprove(selectedIds)}
            className="cursor-pointer bg-[var(--erp-pos)] text-white hover:opacity-90 border-none shadow-none gap-1.5"
            style={{
              backgroundColor: selectedIds.length ? c.pos : undefined,
              opacity: selectedIds.length ? 1 : 0.5,
            }}
          >
            <CheckSquare className="size-4" /> Bulk Approve (
            {selectedIds.length})
          </Button>
        </div>
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
              <TableHead className="p-3 px-5 text-left w-10"></TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                Live
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
                Note
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingSessions.map((session) => {
              const selected = selectedIds.includes(session.id);
              const minutes = getRoundedLiveMinutes(
                getLiveNetMinutes(session),
                roundingPolicy,
              );
              return (
                <TableRow
                  key={session.id}
                  className="border-b border-border"
                  style={{ borderColor: "var(--erp-border)" }}
                >
                  <TableCell className="p-3 px-5 align-middle">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(session.id)}
                      className="border-none bg-transparent cursor-pointer p-0 text-muted-foreground"
                      style={{
                        color: selected ? c.accent : "var(--erp-ink4)",
                      }}
                    >
                      {selected ? (
                        <CheckSquare className="size-[17px]" />
                      ) : (
                        <Square className="size-[17px]" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle">
                    <div
                      className="text-sm font-bold text-foreground"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {getStaffName(session.staff_id)}
                    </div>
                    <div
                      className="text-xs text-muted-foreground mt-1"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      {dateLabel(session.live_date)} · {session.platform}
                    </div>
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle">
                    <div
                      className="text-sm font-semibold text-foreground"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {timeLabel(session.start_datetime)} -{" "}
                      {timeLabel(session.end_datetime)}
                    </div>
                    <div
                      className="text-xs text-muted-foreground mt-1"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      {minutes} นาที ·{" "}
                      {getLiveDecimalHours(minutes).toFixed(2)} ชม.
                    </div>
                  </TableCell>
                  <TableCell
                    className="p-4 px-5 align-middle text-right text-sm font-bold text-foreground"
                    style={{ color: "var(--erp-ink)" }}
                  >
                    {formatBaht(session.revenue_generated)}
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle text-sm font-bold">
                    <Badge variant={session.has_clip ? "normal" : "low"}>
                      {session.has_clip ? "มีคลิป" : "ไม่มีคลิป"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="p-4 px-5 align-middle text-xs text-muted-foreground max-w-[180px] truncate"
                    style={{ color: "var(--erp-ink2)" }}
                  >
                    {session.host_notes}
                  </TableCell>
                  <TableCell className="p-4 px-5 align-middle">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove([session.id])}
                        className="h-8 w-8 p-0 cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        style={{ color: c.pos }}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(session.id)}
                        className="h-8 w-8 p-0 cursor-pointer text-red-600 border-red-200 hover:bg-red-50"
                        style={{ color: c.neg }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {pendingSessions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center p-8 text-sm text-muted-foreground"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  ไม่มีรายการรออนุมัติ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

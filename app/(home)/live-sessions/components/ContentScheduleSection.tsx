"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ContentScheduleItem, ContentScheduleStatus } from "@/lib/store/erpTypes";

interface ContentScheduleSectionProps {
  contentSchedule: ContentScheduleItem[];
  showCalendar: boolean;
  onUpdateStatus: (id: string, status: ContentScheduleStatus) => void;
}

export function ContentScheduleSection({
  contentSchedule,
  showCalendar,
  onUpdateStatus,
}: ContentScheduleSectionProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  return (
    <>
      {/* Content Calendar View */}
      {showCalendar && (
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
            className="p-4 px-5 border-b border-border text-sm font-semibold text-foreground"
            style={{
              borderColor: "var(--erp-border)",
              color: "var(--erp-ink)",
            }}
          >
            Content Calendar
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
                    วันที่
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    เวลา
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    แพลตฟอร์ม
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Host
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
                  ></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...contentSchedule]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-muted/50 transition-colors border-b border-border"
                      style={{ borderColor: "var(--erp-border)" }}
                    >
                      <TableCell className="p-4 px-5 align-middle">
                        <Mono t={t} size={12}>
                          {s.date}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <Mono t={t} size={12}>
                          {s.startTime}–{s.endTime}
                        </Mono>
                      </TableCell>
                      <TableCell
                        className="p-4 px-5 align-middle text-sm font-semibold text-[var(--erp-accent)]"
                        style={{ color: c.accent }}
                      >
                        {s.platform}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <Mono t={t} size={11} color={c.accent}>
                          {s.account}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <Badge
                          variant={
                            s.status === "scheduled" ? "bundle" : "outline"
                          }
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <div className="flex gap-2">
                          {s.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateStatus(s.id, "scheduled")}
                              className="h-7 text-xs cursor-pointer"
                            >
                              Confirm
                            </Button>
                          )}
                          {s.status === "scheduled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateStatus(s.id, "done")}
                              className="h-7 text-xs cursor-pointer"
                            >
                              Done
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Upcoming Live Schedule */}
      <div className="grid gap-3">
        <div
          className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
          style={{ color: "var(--erp-ink3)" }}
        >
          Upcoming Live Schedule
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contentSchedule
            .filter((s) => s.status !== "done")
            .slice(0, 3)
            .map((s) => (
              <Card
                t={t}
                key={s.id}
                className="border border-border bg-card p-5 flex flex-col justify-between"
                style={{
                  borderColor: "var(--erp-border)",
                  background: "var(--erp-surface)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[11px] font-semibold tracking-wider text-[var(--erp-accent)]"
                      style={{ color: c.accent }}
                    >
                      {s.platform}
                    </span>
                    <Badge
                      variant={s.status === "scheduled" ? "bundle" : "outline"}
                    >
                      {s.status}
                    </Badge>
                  </div>
                </div>
                <div
                  className="flex items-center gap-4 mt-4 pt-3 border-t border-border"
                  style={{ borderColor: "var(--erp-border)" }}
                >
                  <div>
                    <div
                      className="text-[9px] text-muted-foreground uppercase tracking-wider"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      วันเวลา
                    </div>
                    <span className="block mt-0.5">
                      <Mono t={t} size={11} weight={500}>
                        {s.date} · {s.startTime}–{s.endTime}
                      </Mono>
                    </span>
                  </div>
                  <div className="ml-auto text-right">
                    <div
                      className="text-[9px] text-muted-foreground uppercase tracking-wider"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ช่อง
                    </div>
                    <span className="block mt-0.5">
                      <Mono t={t} size={11} weight={500} color={c.accent}>
                        {s.account}
                      </Mono>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </>
  );
}

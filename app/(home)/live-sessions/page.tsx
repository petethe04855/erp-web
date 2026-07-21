"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckSquare,
  Download,
  FileText,
  Printer,
  Square,
  Video,
  X,
} from "lucide-react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar, fmtNum } from "@/components/ui";
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
import {
  contentPosts,
  formatBaht,
  getClipBonus,
  getLiveDecimalHours,
  getLiveHourlyPay,
  getLiveNetMinutes,
  getRoundedLiveMinutes,
  liveStaff,
  adminUsers,
  type RoundingPolicy,
} from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import { ScheduleLiveSheet } from "./components/ScheduleLiveSheet";
import { StaffCheckoutSheet } from "./components/StaffCheckoutSheet";

function dateLabel(v: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
  }).format(new Date(v));
}

function timeLabel(v: string) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(v));
}

function getStaffName(id: string) {
  return liveStaff.find((s) => s.id === id)?.name ?? id;
}

function calcDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 && m > 0
    ? `${h} ชม. ${m} นาที`
    : h > 0
      ? `${h} ชม.`
      : `${m} นาที`;
}

export default function LiveSessionsPage() {
  const { tokens: t } = useTheme();
  const c = t.color;

  const sessions = useErpStore((s) => s.liveSessions);
  const addLiveSession = useErpStore((s) => s.addLiveSession);
  const updateLiveSessionStatus = useErpStore((s) => s.updateLiveSessionStatus);
  const contentSchedule = useErpStore((s) => s.contentSchedule);
  const addContentSchedule = useErpStore((s) => s.addContentSchedule);
  const updateContentScheduleStatus = useErpStore(
    (s) => s.updateContentScheduleStatus,
  );
  const livePayroll = useErpStore((s) => s.settings.livePayroll);
  const currentUser = useErpStore((s) => s.currentUser);
  const canSeeAllPayroll =
    currentUser.role === "owner" || currentUser.role === "accountant";

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [roundingPolicy, setRoundingPolicy] =
    useState<RoundingPolicy>("actual");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  const analytics = useMemo(() => {
    const active = sessions.filter(
      (s) => getLiveNetMinutes(s) > 0 && s.status !== "Rejected",
    );
    const clips = active.filter((s) => s.has_clip).length;
    const revenue = active.reduce((sum, s) => sum + s.revenue_generated, 0);
    const mins = active.reduce(
      (sum, s) =>
        sum + getRoundedLiveMinutes(getLiveNetMinutes(s), roundingPolicy),
      0,
    );
    return {
      active,
      clips,
      revenue,
      totalHours: getLiveDecimalHours(mins),
      contentRate: active.length
        ? Math.round((clips / active.length) * 100)
        : 0,
      pending: sessions.filter((s) => s.status === "Pending"),
      contentGaps: active.filter((s) => !s.has_clip),
    };
  }, [roundingPolicy, sessions]);

  const payrollRows = useMemo(() => {
    return liveStaff.map((staff) => {
      const rows = sessions.filter(
        (s) => s.staff_id === staff.id && s.status !== "Rejected",
      );
      const minutes = rows.reduce(
        (sum, s) =>
          sum + getRoundedLiveMinutes(getLiveNetMinutes(s), roundingPolicy),
        0,
      );
      const revenue = rows.reduce((sum, s) => sum + s.revenue_generated, 0);
      const clips = rows.filter((s) => s.has_clip).length;
      const hourlyPay = getLiveHourlyPay(minutes, livePayroll.hourlyRate);
      const clipBonus = getClipBonus(clips, livePayroll.clipBonus);
      return {
        staff,
        hours: getLiveDecimalHours(minutes),
        revenue,
        clips,
        hourlyPay,
        clipBonus,
        grossPay: hourlyPay + clipBonus,
      };
    });
  }, [roundingPolicy, sessions, livePayroll]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleAddLiveSession(data: any) {
    addLiveSession(data);
    showToast("ส่งรายการไลฟ์เพื่ออนุมัติแล้ว");
  }

  function handleAddContentSchedule(data: any) {
    addContentSchedule(data);
    showToast("เพิ่มรายการ Schedule แล้ว");
  }

  function approve(ids: string[]) {
    ids.forEach((id) => updateLiveSessionStatus(id, "Manager_Approved"));
    setSelectedIds([]);
    showToast(`อนุมัติแล้ว ${ids.length} รายการ`);
  }

  function reject(id: string) {
    updateLiveSessionStatus(id, "Rejected");
    setSelectedIds((ids) => ids.filter((r) => r !== id));
  }

  function exportPayrollCsv() {
    const header = [
      "พนักงาน",
      "ชั่วโมงรวม",
      "ยอดขายรวม",
      "จำนวนคลิป",
      "ค่าแรง",
      "โบนัสคลิป",
      "ยอดจ่าย",
    ];
    const rows = payrollRows.map((r) => [
      r.staff.name,
      r.hours.toFixed(2),
      r.revenue,
      r.clips,
      r.hourlyPay,
      r.clipBonus,
      r.grossPay.toFixed(2),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "live-payroll.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalReach = contentPosts.reduce((s, p) => s + p.reach, 0);
  const avgEng =
    contentPosts.reduce((s, p) => s + p.eng, 0) / contentPosts.length;
  const maxReach = Math.max(...contentPosts.map((p) => p.reach));
  const scheduledCount = contentSchedule.filter(
    (s) => s.status === "scheduled",
  ).length;

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Channels", "Live & Content"]}
        title="Live & Content"
        subtitle="ไลฟ์และคอนเทนต์ · ปฏิทินไลฟ์และผลงานโพสต์"
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 pr-2">
                {toast}
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => setShowCalendar((v) => !v)}
              className="cursor-pointer"
            >
              {showCalendar ? "List View" : "Content Calendar"}
            </Button>
            <Button
              onClick={() => setScheduleOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + Schedule Live
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Reach · MTD",
              value: fmtNum(totalReach),
              sub: `${contentPosts.length} posts`,
              primary: true,
            },
            {
              label: "Avg. Engagement",
              value: `${avgEng.toFixed(1)}%`,
              sub: "across posts",
            },
            {
              label: "Scheduled Lives",
              value: scheduledCount.toString(),
              sub: "upcoming",
            },
            {
              label: "Best Post Reach",
              value: fmtNum(maxReach),
              sub: "top performer",
            },
          ].map((tile) => (
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
                      หัวข้อ
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
                        <TableCell
                          className="p-4 px-5 align-middle text-sm font-medium text-foreground"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {s.topic}
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
                                onClick={() =>
                                  updateContentScheduleStatus(s.id, "scheduled")
                                }
                                className="h-7 text-xs cursor-pointer"
                              >
                                Confirm
                              </Button>
                            )}
                            {s.status === "scheduled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateContentScheduleStatus(s.id, "done")
                                }
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
                        variant={
                          s.status === "scheduled" ? "bundle" : "outline"
                        }
                      >
                        {s.status}
                      </Badge>
                    </div>
                    <div
                      className="text-sm font-semibold text-foreground leading-snug min-h-[40px]"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {s.topic}
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

        {/* Content Performance */}
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
                  {contentPosts.map((p, idx) => (
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
                                width: `${(p.reach / maxReach) * 100}%`,
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

        {/* Live Operations divider */}
        <div
          className="border-t border-border pt-6 mt-4"
          style={{ borderColor: "var(--erp-border)" }}
        >
          <div
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            Live Operations
          </div>
          <div
            className="text-xs text-muted-foreground mt-1"
            style={{ color: "var(--erp-ink3)" }}
          >
            บันทึกเวลา ยอดขาย คลิป และ Payroll Export
          </div>
        </div>

        {/* Rounding toggle + export buttons */}
        <div className="flex gap-2 items-center justify-end flex-wrap">
          <div
            className="inline-flex p-1 bg-muted rounded-lg border border-border"
            style={{
              background: "var(--erp-subtle)",
              borderColor: "var(--erp-border)",
            }}
          >
            {[
              { key: "actual", label: "Actual" },
              { key: "quarter_up", label: "15m Up" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setRoundingPolicy(item.key as RoundingPolicy)}
                className="px-3 py-1.5 border-none rounded-md text-xs font-bold cursor-pointer transition-all"
                style={{
                  background:
                    roundingPolicy === item.key
                      ? "var(--erp-surface)"
                      : "transparent",
                  color:
                    roundingPolicy === item.key ? c.accent : "var(--erp-ink3)",
                  boxShadow:
                    roundingPolicy === item.key
                      ? "0 1px 2px rgba(0,0,0,0.08)"
                      : "none",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={exportPayrollCsv}
            className="cursor-pointer gap-1.5 h-9"
          >
            <Download className="size-4" /> CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="cursor-pointer gap-1.5 h-9"
          >
            <Printer className="size-4" /> PDF
          </Button>
        </div>

        {/* Control Tower Review Queue */}
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
                {analytics.pending.length} รายการรอตรวจ
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCheckoutOpen(true)}
                className="cursor-pointer gap-1.5"
              >
                <Video className="size-4" /> Log Session
              </Button>
              <Button
                disabled={selectedIds.length === 0}
                onClick={() => approve(selectedIds)}
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
                {analytics.pending.map((session) => {
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
                          onClick={() =>
                            setSelectedIds((ids) =>
                              ids.includes(session.id)
                                ? ids.filter((r) => r !== session.id)
                                : [...ids, session.id],
                            )
                          }
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
                            onClick={() => approve([session.id])}
                            className="h-8 w-8 p-0 cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            style={{ color: c.pos }}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reject(session.id)}
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
                {analytics.pending.length === 0 && (
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

        {/* Payroll + Content Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
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
              className="p-4 px-5 border-b border-border flex items-center justify-between gap-4"
              style={{ borderColor: "var(--erp-border)" }}
            >
              <div>
                <div
                  className="text-sm font-bold text-foreground"
                  style={{ color: "var(--erp-ink)" }}
                >
                  Payroll Export Preview
                </div>
                <div
                  className="text-xs text-muted-foreground mt-1"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  (Total Hours × ฿{livePayroll.hourlyRate}/ชม.) + (Clips × ฿
                  {livePayroll.clipBonus}/คลิป)
                </div>
              </div>
              <FileText
                className="size-5 text-muted-foreground"
                style={{ color: "var(--erp-ink4)" }}
              />
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
                      พนักงาน
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ชั่วโมง
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ยอดขาย
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      คลิป
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Hourly
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Clip Bonus
                    </TableHead>
                    <TableHead
                      className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ยอดจ่าย
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(canSeeAllPayroll
                    ? payrollRows
                    : payrollRows.filter(
                        (r) => r.staff.name === currentUser.name,
                      )
                  ).map((row) => (
                    <TableRow
                      key={row.staff.id}
                      className="border-b border-border"
                      style={{ borderColor: "var(--erp-border)" }}
                    >
                      <TableCell className="p-4 px-5 align-middle">
                        <div
                          className="text-sm font-bold text-foreground"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {row.staff.name}
                        </div>
                        <div
                          className="text-xs text-muted-foreground mt-1"
                          style={{ color: "var(--erp-ink3)" }}
                        >
                          {row.staff.role}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-sm font-bold">
                        {row.hours.toFixed(2)}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right text-sm font-bold">
                        {formatBaht(row.revenue)}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-sm">
                        {row.clips}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right text-sm font-bold">
                        {formatBaht(row.hourlyPay)}
                      </TableCell>
                      <TableCell
                        className="p-4 px-5 align-middle text-right text-sm font-bold"
                        style={{ color: "var(--erp-warn)" }}
                      >
                        {formatBaht(row.clipBonus)}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right text-sm font-extrabold">
                        {formatBaht(row.grossPay)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

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
              {analytics.contentGaps.map((session) => {
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
                      {session.platform} ·{" "}
                      {formatBaht(session.revenue_generated)}
                    </div>
                  </div>
                );
              })}
              {analytics.contentGaps.length === 0 && (
                <div
                  className="text-center p-6 text-sm text-muted-foreground"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  ไม่มีช่องว่าง Content
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Live Session Ledger */}
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
      </div>

      <ScheduleLiveSheet
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSubmit={handleAddContentSchedule}
        showToast={showToast}
      />

      <StaffCheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        liveStaff={liveStaff}
        sessions={sessions}
        roundingPolicy={roundingPolicy}
        onSubmit={handleAddLiveSession}
        showToast={showToast}
      />
    </div>
  );
}

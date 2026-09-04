"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  contentPosts,
  getClipBonus,
  getLiveDecimalHours,
  getLiveHourlyPay,
  getLiveNetMinutes,
  getRoundedLiveMinutes,
  liveStaff,
  type RoundingPolicy,
} from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import { ScheduleLiveSheet } from "./components/ScheduleLiveSheet";
import { StaffCheckoutSheet } from "./components/StaffCheckoutSheet";
import { LiveKpiTiles } from "./components/LiveKpiTiles";
import { ContentScheduleSection } from "./components/ContentScheduleSection";
import { ContentPerformanceTable } from "./components/ContentPerformanceTable";
import { LiveOperationsBar } from "./components/LiveOperationsBar";
import { LiveReviewQueue } from "./components/LiveReviewQueue";
import { LivePayrollTable, type PayrollRowData } from "./components/LivePayrollTable";
import { ContentGapReport } from "./components/ContentGapReport";
import { LiveSessionLedger } from "./components/LiveSessionLedger";

export default function LiveSessionsPage() {
  const { tokens: t } = useTheme();
  const c = t.color;

  // Store Hooks
  const sessions = useErpStore((s) => s.liveSessions);
  const addLiveSession = useErpStore((s) => s.addLiveSession);
  const updateLiveSessionStatus = useErpStore((s) => s.updateLiveSessionStatus);
  const contentSchedule = useErpStore((s) => s.contentSchedule);
  const addContentSchedule = useErpStore((s) => s.addContentSchedule);
  const updateContentScheduleStatus = useErpStore(
    (s) => s.updateContentScheduleStatus,
  );
  const livePayroll = useErpStore((s) => s.settings.livePayroll);
  const updateSettings = useErpStore((s) => s.updateSettings);
  const currentUser = useErpStore((s) => s.currentUser);
  const canSeeAllPayroll =
    currentUser.role === "owner" || currentUser.role === "accountant";

  // Local State
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [roundingPolicy, setRoundingPolicy] =
    useState<RoundingPolicy>("actual");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [payrollSaveMessage, setPayrollSaveMessage] = useState("");
  const [savingPayroll, setSavingPayroll] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  // Hourly Rate Drafts
  const [hourlyRateDraft, setHourlyRateDraft] = useState<number | "">(
    livePayroll.hourlyRate ? livePayroll.hourlyRate : "",
  );
  const [staffRateDrafts, setStaffRateDrafts] = useState<
    Record<string, number | "">
  >(() =>
    Object.fromEntries(
      liveStaff.map((staff) => {
        const rate =
          livePayroll.staffRates?.[staff.id] ??
          staff.hourlyRate ??
          livePayroll.hourlyRate;
        return [staff.id, rate ? rate : ""];
      }),
    ),
  );

  useEffect(() => {
    setHourlyRateDraft(livePayroll.hourlyRate ? livePayroll.hourlyRate : "");
  }, [livePayroll.hourlyRate]);

  useEffect(() => {
    setStaffRateDrafts(
      Object.fromEntries(
        liveStaff.map((staff) => {
          const rate =
            livePayroll.staffRates?.[staff.id] ??
            staff.hourlyRate ??
            livePayroll.hourlyRate;
          return [staff.id, rate ? rate : ""];
        }),
      ),
    );
  }, [livePayroll]);

  // Derived Sessions for the selected month
  const monthlySessions = useMemo(
    () =>
      sessions.filter((session) =>
        session.live_date.startsWith(payrollMonth),
      ),
    [payrollMonth, sessions],
  );

  // Analytics
  const analytics = useMemo(() => {
    const active = monthlySessions.filter(
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
      pending: monthlySessions.filter((s) => s.status === "Pending"),
      contentGaps: active.filter((s) => !s.has_clip),
    };
  }, [monthlySessions, roundingPolicy]);

  // Payroll Rows
  const payrollRows: PayrollRowData[] = useMemo(() => {
    return liveStaff.map((staff) => {
      const rows = monthlySessions.filter(
        (s) => s.staff_id === staff.id && s.status === "Manager_Approved",
      );
      const minutes = rows.reduce(
        (sum, s) =>
          sum + getRoundedLiveMinutes(getLiveNetMinutes(s), roundingPolicy),
        0,
      );
      const revenue = rows.reduce((sum, s) => sum + s.revenue_generated, 0);
      const clips = rows.filter((s) => s.has_clip).length;

      const currentDraft = staffRateDrafts[staff.id];
      const hourlyRate =
        typeof currentDraft === "number"
          ? currentDraft
          : typeof currentDraft === "string" && currentDraft !== ""
            ? Number(currentDraft)
            : (livePayroll.staffRates?.[staff.id] ??
              staff.hourlyRate ??
              livePayroll.hourlyRate);

      const hourlyPay = getLiveHourlyPay(minutes, hourlyRate);
      const clipBonus = getClipBonus(clips, livePayroll.clipBonus);

      return {
        staff,
        hours: getLiveDecimalHours(minutes),
        revenue,
        clips,
        hourlyRate,
        hourlyPay,
        clipBonus,
        grossPay: hourlyPay + clipBonus,
      };
    });
  }, [monthlySessions, roundingPolicy, livePayroll, staffRateDrafts]);

  const visiblePayrollRows = useMemo(() => {
    return canSeeAllPayroll
      ? payrollRows
      : payrollRows.filter((r) => r.staff.name === currentUser.name);
  }, [canSeeAllPayroll, payrollRows, currentUser.name]);

  const payrollTotals = useMemo(
    () =>
      payrollRows.reduce(
        (totals, row) => ({
          hours: totals.hours + row.hours,
          hourlyPay: totals.hourlyPay + row.hourlyPay,
          clipBonus: totals.clipBonus + row.clipBonus,
          grossPay: totals.grossPay + row.grossPay,
        }),
        { hours: 0, hourlyPay: 0, clipBonus: 0, grossPay: 0 },
      ),
    [payrollRows],
  );

  // Actions
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function savePayrollRates() {
    setSavingPayroll(true);
    setPayrollSaveMessage("");
    const numericHourlyRate = Number(hourlyRateDraft) || 0;
    const numericStaffRates: Record<string, number> = Object.fromEntries(
      Object.entries(staffRateDrafts).map(([id, rate]) => [
        id,
        Number(rate) || 0,
      ]),
    );
    try {
      await updateSettings({
        livePayroll: {
          ...livePayroll,
          hourlyRate: numericHourlyRate,
          staffRates: numericStaffRates,
        },
      });
      setPayrollSaveMessage("บันทึกเรทเรียบร้อยแล้ว");
      showToast("บันทึกค่าไลฟ์ต่อชั่วโมงแล้ว");
    } catch (error) {
      setPayrollSaveMessage(
        error instanceof Error
          ? `บันทึกไม่สำเร็จ: ${error.message}`
          : "บันทึกเรทไม่สำเร็จ",
      );
    } finally {
      setSavingPayroll(false);
    }
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

  function handleToggleSelect(id: string) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((r) => r !== id) : [...ids, id],
    );
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
      .map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-payroll-${payrollMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Top KPIs
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
        <LiveKpiTiles
          totalReach={totalReach}
          avgEng={avgEng}
          scheduledCount={scheduledCount}
          maxReach={maxReach}
          postsCount={contentPosts.length}
        />

        {/* Content Calendar & Upcoming Schedule */}
        <ContentScheduleSection
          contentSchedule={contentSchedule}
          showCalendar={showCalendar}
          onUpdateStatus={updateContentScheduleStatus}
        />

        {/* Content Performance */}
        <ContentPerformanceTable
          posts={contentPosts}
          maxReach={maxReach}
        />

        {/* Live Operations Header & Controls */}
        <LiveOperationsBar
          payrollMonth={payrollMonth}
          onPayrollMonthChange={setPayrollMonth}
          canSeeAllPayroll={canSeeAllPayroll}
          hourlyRateDraft={hourlyRateDraft}
          onHourlyRateDraftChange={setHourlyRateDraft}
          savingPayroll={savingPayroll}
          payrollSaveMessage={payrollSaveMessage}
          onSavePayrollRates={savePayrollRates}
          roundingPolicy={roundingPolicy}
          onRoundingPolicyChange={setRoundingPolicy}
          onExportCsv={exportPayrollCsv}
          onPrintPdf={() => window.print()}
        />

        {/* Review Queue */}
        <LiveReviewQueue
          pendingSessions={analytics.pending}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onApprove={approve}
          onReject={reject}
          onOpenCheckout={() => setCheckoutOpen(true)}
          roundingPolicy={roundingPolicy}
        />

        {/* Payroll Summary + Content Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <LivePayrollTable
            payrollMonth={payrollMonth}
            clipBonusRate={livePayroll.clipBonus}
            payrollRows={visiblePayrollRows}
            payrollTotals={payrollTotals}
            canSeeAllPayroll={canSeeAllPayroll}
            staffRateDrafts={staffRateDrafts}
            onStaffRateDraftChange={(staffId, val) =>
              setStaffRateDrafts((prev) => ({ ...prev, [staffId]: val }))
            }
          />
          <ContentGapReport contentGaps={analytics.contentGaps} />
        </div>

        {/* Ledger */}
        <LiveSessionLedger
          sessions={sessions}
          roundingPolicy={roundingPolicy}
        />
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

import React, { useState } from "react";
import type { RoundingPolicy, PayrollRow } from "../types/live";
import { useLivePayroll } from "../hooks/useLive";
import {
  settingsApi,
  type LivePayrollSettings,
} from "@/features/settings/api/settingsApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Clock,
  Award,
  ShieldAlert,
  Settings2,
  Save,
  Check,
  Calendar,
  UserCheck,
  FileSpreadsheet,
  X,
} from "lucide-react";

interface LivePayrollTableProps {
  canViewPayroll: boolean;
  selectedMonth: string;
  onMonthChange?: (month: string) => void;
  isOwner?: boolean;
}

export const LivePayrollTable: React.FC<LivePayrollTableProps> = ({
  canViewPayroll,
  selectedMonth,
  onMonthChange,
  isOwner = false,
}) => {
  const queryClient = useQueryClient();
  const [roundingPolicy, setRoundingPolicy] =
    useState<RoundingPolicy>("quarter_up");
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Fetch Payroll Data for the selected month
  const {
    data: payroll,
    isLoading,
    error,
  } = useLivePayroll(
    { month: selectedMonth, rounding: roundingPolicy },
    canViewPayroll,
  );

  // Fetch Settings (to view & edit wage rates)
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
    enabled: canViewPayroll,
  });

  // Rates draft state for the modal
  const [defaultHourlyDraft, setDefaultHourlyDraft] = useState<number>(120);
  const [clipBonusDraft, setClipBonusDraft] = useState<number>(50);
  const [staffRatesDraft, setStaffRatesDraft] = useState<
    Record<string, number>
  >({});

  const handleOpenRateModal = () => {
    const currentPayrollSettings = settingsData?.livePayroll;
    setDefaultHourlyDraft(currentPayrollSettings?.hourlyRate ?? 120);
    setClipBonusDraft(currentPayrollSettings?.clipBonus ?? 50);
    setStaffRatesDraft(currentPayrollSettings?.staffRates ?? {});
    setSaveSuccessMsg("");
    setRateModalOpen(true);
  };

  const updateRatesMutation = useMutation({
    mutationFn: (newPayrollSettings: LivePayrollSettings) =>
      settingsApi.saveLivePayroll(newPayrollSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["live", "payroll"] });
      setSaveSuccessMsg(
        "บันทึกอัตราค่าจ้างเรียบร้อย ระบบคำนวณยอดเงินเดือนใหม่แล้ว",
      );
      setTimeout(() => {
        setRateModalOpen(false);
        setSaveSuccessMsg("");
      }, 1500);
    },
  });

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateRatesMutation.mutate({
      hourlyRate: Number(defaultHourlyDraft) || 120,
      clipBonus: Number(clipBonusDraft) || 0,
      staffRates: staffRatesDraft,
    });
  };

  if (!canViewPayroll) {
    return null;
  }

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <DollarSign size={15} />
            </span>
            <h3 className="text-sm font-bold text-neutral-900">
              สรุปชั่วโมงไลฟ์และประมาณการเงินเดือน/ค่าจ้างประจำเดือน (Live
              Payroll)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            สรุปชั่วโมงจริง, อัตราค่าไลฟ์ต่อชั่วโมง, โบนัสคลิป
            และคำนวณยอดสุทธิที่พนักงานจะได้รับในเดือนนี้
          </p>
        </div>

        {/* Controls: Month picker, Rounding policy, Wage rate button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onMonthChange && (
            <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/70 px-2 py-1">
              <Calendar size={13} className="text-neutral-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-neutral-800 focus:outline-hidden"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500 whitespace-nowrap">
              ปัดเศษ:
            </span>
            <select
              value={roundingPolicy}
              onChange={(e) =>
                setRoundingPolicy(e.target.value as RoundingPolicy)
              }
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-hidden"
            >
              <option value="quarter_up">ปัดขึ้นทุก 15 นาที (+15m)</option>
              <option value="up10">ปัดขึ้นทุก 10 นาที (+10m)</option>
              <option value="up30">ปัดขึ้นทุก 30 นาที (+30m)</option>
              <option value="actual">ตามจริง (Actual)</option>
            </select>
          </div>

          {isOwner && (
            <button
              onClick={handleOpenRateModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <Settings2 size={13} /> ตั้งค่าเรทค่าไลฟ์
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-neutral-400">
          กำลังคำนวณชั่วโมงและยอดเงินเดือนทีมไลฟ์...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
          <ShieldAlert size={15} />
          <span>ไม่สามารถดึงข้อมูล Payroll ได้ หรือไม่มีสิทธิ์เข้าถึง</span>
        </div>
      ) : !payroll || payroll?.staff_payroll?.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          ยังไม่มีเซสชันที่อนุมัติในเดือน {selectedMonth}{" "}
          (ระบบจะคำนวณเฉพาะรอบที่ Owner กดอนุมัติแล้ว)
        </div>
      ) : (
        <>
          {/* Summary Mini-cards (แบบสลิปสรุปภาพรวมรายเดือน) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200/60">
              <span className="text-[11px] text-neutral-500 font-medium">
                จำนวนทีมไลฟ์ที่มีผลงาน
              </span>
              <div className="text-base font-bold text-neutral-900 mt-0.5">
                {payroll?.staff_payroll?.length} คน
              </div>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200/60">
              <span className="text-[11px] text-neutral-500 font-medium">
                ชั่วโมงที่อนุมัติรวม
              </span>
              <div className="text-base font-bold text-neutral-900 mt-0.5">
                {payroll.total_hours} ชม.
              </div>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200/60">
              <span className="text-[11px] text-neutral-500 font-medium">
                คลิปสรุปที่ได้รับโบนัส
              </span>
              <div className="text-base font-bold text-purple-700 mt-0.5">
                {payroll.total_clips} คลิป
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-200/80">
              <span className="text-[11px] text-emerald-800 font-semibold">
                ยอดจ่ายสุทธิรวม (เดือนนี้)
              </span>
              <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                ฿{payroll.total_pay.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 font-semibold text-neutral-800">
                <tr>
                  <th className="px-3 py-2.5">พนักงาน (Staff)</th>
                  <th className="px-3 py-2.5 text-center">
                    รอบที่ไลฟ์ (อนุมัติ)
                  </th>
                  <th className="px-3 py-2.5 text-right">เวลารวมสุทธิ</th>
                  <th className="px-3 py-2.5 text-right">ชั่วโมงคำนวณ</th>
                  <th className="px-3 py-2.5 text-right">เรทค่าไลฟ์ / ชม.</th>
                  <th className="px-3 py-2.5 text-right">ค่าชั่วโมงรวม</th>
                  <th className="px-3 py-2.5 text-right">โบนัสคลิป</th>
                  <th className="px-3 py-2.5 text-right font-bold text-neutral-900 bg-emerald-50/40">
                    ยอดเงินเข้าสุทธิ (฿)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payroll?.staff_payroll?.map((row) => (
                  <tr
                    key={row.staff_id}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-neutral-900">
                      <div className="font-semibold text-neutral-900">
                        {row.staff_name}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        ID: #{row.staff_id}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                        {row.approved_sessions_count} รอบ
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-neutral-500">
                      {row.total_net_minutes} นาที
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-neutral-900">
                      {row.decimal_hours} ชม.
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      <span className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 font-semibold text-neutral-800">
                        ฿{row.hourly_rate}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-neutral-700">
                      ฿
                      {row.base_pay.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {row.clip_bonus_count > 0 ? (
                        <span className="text-purple-700 font-medium">
                          +฿{row.clip_bonus_pay.toLocaleString()} (
                          {row.clip_bonus_count} คลิป)
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30 text-sm">
                      ฿
                      {row.total_pay.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal: ตั้งค่าอัตราค่าจ้างพนักงาน (Hourly Rates / Staff Rates) */}
      {rateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-neutral-700" />
                <h4 className="text-sm font-bold text-neutral-900">
                  ตั้งค่าอัตราค่าจ้างต่อชั่วโมงและโบนัสคลิป
                </h4>
              </div>
              <button
                onClick={() => setRateModalOpen(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    อัตราเริ่มต้นมาตรฐาน (บาท/ชม.){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={defaultHourlyDraft}
                    onChange={(e) =>
                      setDefaultHourlyDraft(Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                    required
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    ใช้เป็นค่าตั้งต้นสำหรับทุกคน
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    โบนัสทำคลิปสรุป (บาท/คลิป)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={clipBonusDraft}
                    onChange={(e) => setClipBonusDraft(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    จ่ายเพิ่มให้หากมีคลิปสรุปไลฟ์
                  </p>
                </div>
              </div>

              {/* Individual Staff Rates */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
                <h5 className="font-bold text-neutral-800 mb-1">
                  กำหนดอัตราค่าไลฟ์เฉพาะบุคคล (Staff Custom Rates)
                </h5>
                <p className="text-[11px] text-neutral-500 mb-3">
                  กำหนดเรทค่าไลฟ์เฉพาะสำหรับพนักงานแต่ละคน
                  หากไม่ระบุจะใช้อัตราเริ่มต้นมาตรฐาน
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {payroll?.staff_payroll?.map((staff) => {
                    const staffKey = String(staff.staff_id);
                    const currentRate =
                      staffRatesDraft[staffKey] ?? defaultHourlyDraft;

                    return (
                      <div
                        key={staff.staff_id}
                        className="flex items-center justify-between gap-3 bg-white p-2 rounded-md border border-neutral-200"
                      >
                        <span className="font-medium text-neutral-800">
                          {staff.staff_name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400 text-[11px]">
                            ฿
                          </span>
                          <input
                            type="number"
                            min="0"
                            placeholder={String(defaultHourlyDraft)}
                            value={staffRatesDraft[staffKey] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStaffRatesDraft((prev) => {
                                const next = { ...prev };
                                if (val === "") {
                                  delete next[staffKey];
                                } else {
                                  next[staffKey] = Number(val);
                                }
                                return next;
                              });
                            }}
                            className="w-20 rounded border border-neutral-300 px-2 py-1 text-xs text-right focus:border-neutral-900 focus:outline-hidden"
                          />
                          <span className="text-neutral-500 text-[11px]">
                            /ชม.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 font-medium">
                  <Check size={14} /> {saveSuccessMsg}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setRateModalOpen(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={updateRatesMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  <Save size={13} />
                  {updateRatesMutation.isPending
                    ? "กำลังบันทึก..."
                    : "บันทึกอัตราค่าจ้าง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

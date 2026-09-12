import React, { useState } from "react";
import type { LiveSession } from "../types/live";
import { useApproveLiveSession, useRejectLiveSession } from "../hooks/useLive";
import { CheckCircle2, XCircle, Clock, ExternalLink, AlertTriangle } from "lucide-react";

interface LiveReviewQueueProps {
  sessions: LiveSession[];
  canReview: boolean;
}

export const LiveReviewQueue: React.FC<LiveReviewQueueProps> = ({ sessions, canReview }) => {
  const pendingSessions = sessions.filter((s) => s.status === "PENDING");
  const approveMutation = useApproveLiveSession();
  const rejectMutation = useRejectLiveSession();

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (pendingSessions.length === 0) {
    return null;
  }

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      setErrorMsg("กรุณาระบุเหตุผลการปฏิเสธ");
      return;
    }

    try {
      await rejectMutation.mutateAsync({ id: rejectingId, reason: rejectReason.trim() });
      setRejectingId(null);
      setRejectReason("");
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || "เกิดข้อผิดพลาดในการปฏิเสธ");
    }
  };

  return (
    <div className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Clock size={14} />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">
            รายการรอตรวจ / รออนุมัติ ({pendingSessions.length} เซสชัน)
          </h3>
        </div>
        <span className="text-xs text-amber-700 font-medium">
          อนุมัติแล้วจะถูกนำไปคำนวณใน Payroll ประจำเดือน
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pendingSessions.map((session) => {
          const start = new Date(session.start_datetime);
          const end = new Date(session.end_datetime);
          const timeStr = `${start.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })} – ${end.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}`;

          return (
            <div
              key={session.id}
              className="rounded-lg border border-amber-200/80 bg-white p-3.5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-neutral-700">
                    {session.session_no}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-700">
                    {session.platform}
                  </span>
                </div>

                <div className="mt-2 text-xs text-neutral-600 space-y-1">
                  <p className="font-semibold text-neutral-900">
                    {session.staff?.name || `Staff #${session.staff_id}`}
                    {session.tiktok_account && (
                      <span className="text-neutral-400 font-normal ml-1">
                        ({session.tiktok_account})
                      </span>
                    )}
                  </p>
                  <p className="text-neutral-500">
                    {session.live_date} · {timeStr}
                    {session.break_minutes > 0 && ` (พัก ${session.break_minutes} น.)`}
                  </p>
                  <p className="font-medium text-emerald-600">
                    ยอดขาย: ฿{(session.revenue_generated || 0).toLocaleString()}
                  </p>
                  {session.clip_link && (
                    <a
                      href={session.clip_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                    >
                      <ExternalLink size={12} /> ดูคลิปสรุป
                    </a>
                  )}
                </div>
              </div>

              {canReview && (
                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setRejectingId(session.id);
                      setRejectReason("");
                      setErrorMsg("");
                    }}
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={13} /> ปฏิเสธ
                  </button>
                  <button
                    onClick={() => handleApprove(session.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} /> อนุมัติ
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reject Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle size={18} />
              <h4 className="text-sm font-bold text-neutral-900">ปฏิเสธเซสชันไลฟ์</h4>
            </div>
            <p className="text-xs text-neutral-500 mb-3">
              กรุณาระบุเหตุผลในการปฏิเสธ เพื่อแจ้งให้ทีมงานทราบและปรับปรุง
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="เช่น ขาดหลักฐานยอดขาย, ลิงก์คลิปเข้าไม่ได้..."
                className="w-full h-20 rounded-lg border border-neutral-300 p-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                required
              />
              {errorMsg && <p className="text-xs text-rose-600 mt-1">{errorMsg}</p>}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {rejectMutation.isPending ? "กำลังบันทึก..." : "ยืนยันปฏิเสธ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
